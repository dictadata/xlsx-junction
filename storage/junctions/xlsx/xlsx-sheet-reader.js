/**
 * storage/junctions/xlsx-data-parser
 *
 * Iterates worksheet cells groups the cells into rows.
 *
 * Output is an stream of arrays.
 */
"use strict";

const { Readable } = require('node:stream');

const XLSX = require('xlsx');

module.exports = class XlsxSheetReader extends Readable {

  /**
   *
   * @param {object} worksheet XLSX worksheet object with cell properties
   * @param {object} [options]
   * @param {string} [options.range] A1-style range, e.g. "A3:M24"
   * @param {string} [options.heading] PDF section heading where data is located, default: none
   * @param {string} [options.stopHeading] PDF section heading after data table, default: none
   * @param {number} [options.cells] minimum number of cells in a row, default: 1
   * @param {number} [options.pageHeader] height of page header area in rows, default: 0
   * @param {number} [options.pageFooter] height of page footer area in rows, default: 0
   * @param {boolean} [options.repeatingHeaders] indicates if table headers are repeated on each page, default: false
   */
  constructor(worksheet, options = {}) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 64,
      autoDestroy: false
    };
    super(streamOptions);
    //super({ captureRejections: true });

    this.worksheet = worksheet;
    this.options = Object.assign({ cells: 1 }, options);

    // parsing properties
    this.rows = []; // array of data values
    this.headingFound = Object.hasOwn(options, "heading") ? false : true;
    this.tableFound = this.headingFound;
    this.tableDone = false;
    this.headersRow;

    if (Object.hasOwn(this.options, "range")) {
      let cells = options.range.split(":");
      if (cells.length > 0)
        this.topLeft = this.getAddress(cells[ 0 ]);
      if (cells.length > 1)
        this.bottomRight = this.getAddress(cells[ 1 ]);
    }
  }

  async _construct(callback) {
    this.started = false;
    callback();
  }

  /**
   * Parse the worksheet cells.
   * @returns Rows an array containing arrays of data values.
   * If using an event listener the return value will be an empty array.
   */
  async parse() {

    try {
      await this.parseCells();

      this.push(null);
      // this.emit("end");
      // return this.rows;
    }
    catch (err) {
      console.error(err);
      this.destroy(err);
      //this.emit("error", err);
    }
  }

  getAddress(a1_address) {
    let addr = {}
    let rx = a1_address.match(/([A-Z]*)([0-9]*)/)
    addr.column = rx[ 1 ];
    addr.row = rx[ 2 ];
    return addr;
  }

  compareAddress(a1, a2) {
    if (a1.row.length < a2.row.length)
      return -1;
    if (a1.row.length > a2.row.length)
      return 1;
    if (a1.row < a2.row)
      return -1;
    if (a1.row > a2.row)
      return 1;

    if (a1.column.length < a2.column.length)
      return -1;
    if (a1.column.length > a2.column.length)
      return 1;
    if (a1.column < a2.column)
      return -1;
    if (a1.column > a2.column)
      return 1;

    return 0;
  }

  inRange(address) {
    if (!this.topLeft)
      return true;

    if (this.compareAddress(address, this.topLeft) < 0)
      return false;
    if (this.compareAddress(address, this.bottomRight) > 0)
      return false;

    return true;
  }

  /**
   * Iterate the cells and determine rows.
   */
  async parseCells() {

    let row = [];
    this.count = 1;

    let prevRowNum = "0";
    for (let [ a1_address, cell ] of Object.entries(this.worksheet)) {
      if (a1_address[ 0 ] === '!')
        continue;

      let address = this.getAddress(a1_address);
      if (this.inRange(address)) {
        if (row.length > 0 && (address.row !== prevRowNum)) {
          if (this.filters(row))
            this.output(row);
          // start new row
          row = [];
        }

        if (this.tableDone)
          break;

        // add cell value to row
        // https://docs.sheetjs.com/docs/csf/cell#cell-types
        switch (cell.t) {
          case "n":
            if (XLSX.SSF.is_date(cell.z))
              // date format, take the text version; cellDates: false
              row.push(cell.w)
            else
              row.push(cell.v);
            break;

          case "s":
          case "d": // value converted to UTC string by Sheet.js; cellDates: true
          case "b":
            row.push(cell.v);
            break;

          case "e": // error
          case "z": // stub
          default:
            // do nothing
            break;
        }

        prevRowNum = address.row;
      }
    }

    // push last row
    if (this.filters(row)) {
      this.output(row);
    }
  }

  /**
   * Performs row filtering.
   *
   * @param {*} row is an array of data values
   */
  filters(row) {
    if (!this.headingFound) {
      this.headingFound = this.compareHeading(row, this.options.heading);
    }
    else if (!this.tableFound) {
      this.tableFound = row.length >= this.options.cells;
    }
    else if (this.options.heading && !this.tableDone) {
      this.tableDone = (row.length < this.options.cells) || this.compareHeading(row, this.options.stopHeading);
    }

    let output = this.headingFound && this.tableFound && !this.tableDone && row.length >= this.options.cells;

    if (output && (this.options.repeatingHeaders || this.options.repeating)) {
      // skip repeating header rows
      if (!this.headersRow)
        this.headersRow = row;
      else
        output = !this.rowsEqual(this.headersRow, row);
    }

    return output;
  }

  /**
   * Emits or appends data to output.
   *
   * @param {*} row is an array of data values
   */
  output(row) {
    this.push(row);
    /*
    if (this.listenerCount("data") > 0) {
      this.emit("data", row);
    }
    else
      this.rows.push(row);
    */
    this.count++;
  }

  /**
  *
  * @param {object} row - the row to check
  * @param {string} heading - text to compare against
  */
  compareHeading(row, heading) {
    if (row == null || row.length === 0)
      return false;

    if (Object.prototype.toString.call(heading).slice(8, -1) === "RegExp")
      return heading.test(row[ 0 ]);
    else
      return row[ 0 ] === heading;

  }

  rowsEqual(row1, row2) {
    if (!row1 || !row2) {
      console.log("row1 " + row1);
      console.log("row2 " + row2);
      return false;
    }

    var i = row1.length;
    if (i !== row2.length)
      return false;

    while (i--) {
      if (row1[ i ] !== row2[ i ])
        return false;
    }

    return true;
  }


  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    // ignore size
    try {
      if (!this.started) {
        this.started = true;
        this.parse();
      }
    }
    catch (err) {
      this.destroy(err);
    }
  }

};
