/**
 * storage/junctions/xlsx-data-parser
 *
 */

// Iterates worksheet cells groups the cells into rows.
//
// Output is an array of arrays.
//
"use strict";

const EventEmitter = require('node:events');
const { join } = require("node:path");

module.exports = class XlsxDataParser extends EventEmitter {

  /**
   *
   * @param {Object} worksheet XLSX worksheet object with cell properties
   * @param {Object} options
   * @property {String} range A1-style range, e.g. "A3:M24"
   * @property {String} heading PDF section heading where data is located, default: none
   * @property {Integer} cells minimum number of cells in a row, default: 1
   * @property {Integer} pageHeader height of page header area in rows, default: 0
   * @property {Integer} pageFooter height of page footer area in rows, default: 0
   * @property {Boolean} repeatingHeaders indicates if table headers are repeated on each page, default: false
   */
  constructor(worksheet, options = {}) {
    super({ captureRejections: true });

    this.worksheet = worksheet;
    this.options = Object.assign({ cells: 1 }, options);

    // parsing properties
    this.rows = []; // array of data values
    this.headingFound = options.heading ? false : true;
    this.tableFound = this.headingFound;
    this.tableDone = false;
    this.headersRow;

  }

  /**
   * Parse the worksheet cells.
   * @returns Rows an array containing arrays of data values.
   * If using an event listener the return value will be an empty array.
   */
  async parse() {

    try {
      await this.parseCells();

      this.emit("end");
      return this.rows;
    }
    catch (err) {
      console.error(err);
      this.emit("error", err);
    }
  }

  splitAddress(address) {
    let result = []
    let rx = address.match(/([A-Z]*)([0-9]*)/)
    result.push(rx[ 1 ]);
    result.push(rx[ 2 ]);
    return result;
  }

  /**
   * Iterate the cells and determine rows.
   */
  async parseCells() {

    let row = [];
    this.count = 1;

    let prevRowNum = "0";
    for (let [ address, cell ] of Object.entries(this.worksheet)) {
      if (address[ 1 ] === '!')
        continue;

      let [ column, rowNum ] = splitAddress(address);

      // determine if row should be output
      if (row.length > 0 && (rowNum !== prevRowNum)) {
        if (this.filters(row))
          this.output(row);
        // start new row
        row = [];
      }
      if (this.tableDone)
        break;

      // add cell value to row;
      row.push(cell.v);
      prevRowNum = rowNum;
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
      if (row.length > 0 &&
        ((this.isRegExp(this.options.heading) && row[ 0 ].match(this.options.heading))
          || (row[ 0 ] === this.options.heading))
      )
        this.headingFound = true;
    }
    else if (!this.tableFound) {
      this.tableFound = row.length >= this.options.cells;
    }
    else if (this.options.heading && !this.tableDone) {
      this.tableDone = row.length < this.options.cells;
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
    if (this.listenerCount("data") > 0)
      this.emit("data", row);
    else
      this.rows.push(row);

    this.count++;
  }

  /**
  * Looks at deep type of object for "regex".
  *
  * @param {*} obj - the object to check
  */
  isRegExp(obj) {
    if (obj == null)
      return false;

    var deepType = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    return deepType === 'regexp';
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

};
