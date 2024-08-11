/**
 * storage/junctions/xlsx-sheet-reader
 *
 * Iterates worksheet cells groups the cells into rows.
 *
 * Output is an stream of arrays.
 */
"use strict";

const EventEmitter = require('node:events');

const XLSX = require('xlsx');

module.exports = class XlsxDataParser extends EventEmitter {

  /**
   *
   * @param {object}  options
   * @param {object}  worksheet XLSX worksheet object with cell properties
   * @param {string}  [options.range]       - data selection, A1-style range, e.g. "A3:M24", default all rows/columns
   * @param {number|string} [options.cells] - minimum number cells in a row for output, or "min-max" e.g. "7-9"
   * @param {boolean}  [options.missingCells] insert null values for missing cells
   * @param {string}  [options.heading]     - PDF section heading or text before data table, default: none
   * @param {string}  [options.stopHeading] - PDF section heading or text after data table, default: none
   * @param {boolean} [options.repeating]   - indicates if table headers are repeated on each page, default: false
   * @param {boolean} [options.trim]        - trim cell values, default true
   */
  constructor(options = {}) {
    super({ captureRejections: true });

    this.worksheet = options.worksheet;
    this.options = Object.assign({}, options);

    let range = Object.hasOwn(this.options, "range") ? options.range.split(":") : this.worksheet[ "!ref" ].split(":");
    if (range.length > 0)
      this.topLeft = this.getAddress(range[ 0 ]);
    if (range.length > 1)
      this.bottomRight = this.getAddress(range[ 1 ]);

    this.missingCells = options.missingCells;

    this.cells = {
      min: 1,
      max: 256,
      heading: 0  // RepeatHeading
    };
    if (options.cells) {
      if (typeof options.cells === "number") {
        this.cells.min = options.cells;
      }
      else if (typeof options.cells === "string") {
        let minmax = options.cells.split("-")
        if (minmax.length > 1)
          this.cells.min = parseInt(minmax[ 0 ]);
        if (minmax.length > 2)
          this.cells.max = parseInt(minmax[ 1 ]);
      }
    }

    let header = options.RepeatHeading?.header || options[ "RepeatHeading.header" ] || options.header;
    if (header)
      this.cells.heading = 1;

    // parsing properties
    this.rows = []; // array of data values
    this.headingFound = Object.hasOwn(options, "heading") ? false : true;
    this.tableFound = this.headingFound;
    this.tableDone = false;
    this._headersRow;

    // parser state
    this.started = false;
    this.paused = false;
    this.cancelled = false;
  }

  /**
   * Parse worksheet cells.
   * @returns an array of rows (arrays) containing ordered cell values.
   * If using an event listener then return value will be an empty array.
   */
  async parse() {
    // console.debug("parser parse");

    try {
      // parsing state
      this.entries = Object.entries(this.worksheet);
      this.pos = 0;
      this.len = this.entries.length;
      this.prevAddress = this.topLeft;
      this.row = [];
      this.count = 0;
      this.started = true;

      await this.parseCells();
      return this.rows;
    }
    catch (err) {
      console.error(err);
      this.emit("error", err);
    }
  }

  pause() {
    // console.debug("parser pause");
    this.paused = true;
  }

  resume() {
    // console.debug("parser resume");
    if (this.paused && !this.cancelled) {
      this.paused = false;
      this.parseCells();
    }
  }

  cancel() {
    // console.debug("parser cancel");
    this.cancelled = true;
  }

  /**
   * Iterate worksheet cells and output rows.
   */
  async parseCells() {
    if (this.pos >= this.len)
      return;

    for (; this.pos < this.len; this.pos++) {
      if (this.tableDone || this.paused || this.cancelled)
        break;

      let [ a1_address, cell ] = this.entries[ this.pos ];
      if (a1_address[ 0 ] === '!') {
        if (a1_address === "!ref") {
          // could log a warning, but shouldn't happen
        }
        continue;
      }

      let address = this.getAddress(a1_address);
      if (this.inRange(address)) {

        if (this.row.length >= 0 && (address.row !== this.prevAddress.row)) {
          if (this.missingCells && this.row.length >= this.cells.min) {
            // insert missing cells at end of row
            let col = this.incCol(this.prevAddress.column);
            while (this.lteCol(col, this.bottomRight.column)) {
              this.row.push(null);
              col = this.incCol(col);
            }
          }

          // done with this row
          if (this.process(this.row))
            await this.output(this.row);

          // start new row
          this.row = [];
          this.prevAddress.row = address.row;
          this.prevAddress.column = this.topLeft.column;
        }

        if (this.missingCells) {
          // insert missing cells into row
          let col = this.incCol(this.prevAddress.column);
          while (this.ltCol(col, address.column)) {
            this.row.push(null);
            col = this.incCol(col);
          }
        }

        // add cell value to row
        // https://docs.sheetjs.com/docs/csf/cell#cell-types
        switch (cell.t) {
          case "n": // numeric code
            if (XLSX.SSF.is_date(cell.z))
              // date format, take the text version; cellDates: false
              this.row.push(cell.w)
            else
              this.row.push(cell.v);
            break;

          case "s": // string text
            if ((Object.hasOwn(this.options, "trim") ? this.options.trim : true))
              this.row.push(cell.v.trim());
            else
              this.row.push(cell.v);
            break;

          case "d": // value converted to UTC string by Sheet.js; cellDates: true
          case "b": // boolean
            this.row.push(cell.v);
            break;

          case "e": // error
          case "z": // stub
          default:
            // do nothing
            break;
        }

        this.prevAddress = address;
      }
    }

    // push last row
    if (!this.paused && !this.cancelled && this.process(this.row)) {
      await this.output(this.row);
    }

    if (!this.paused || this.cancelled)
      this.emit("end");
  }

  getAddress(a1_address) {
    let addr = {}
    let rx = a1_address.match(/([A-Z]*)([0-9]*)/)
    addr.column = rx[ 1 ];
    addr.row = rx[ 2 ];
    return addr;
  }

  /**
   * determines if a1 is above-left of or equal to a2
   * @param {*} a1
   * @param {*} a2
   * @returns
   */
  compareAddress(a1, a2) {
    if (parseInt(a1.row) <= parseInt(a2.row) && a1.column <= a2.column)
      return true;
    else
      return false;
  }

  inRange(address) {
    if (!this.bottomRight)
      return true;  // no range specified

    if (this.compareAddress(this.topLeft, address) && this.compareAddress(address, this.bottomRight))
      return true;
    else
      return false;
  }

  ltCol(col1, col2) {
    return (col1.length < col2.length || (col1.length === col2.length && col1 < col2));
  }

  lteCol(col1, col2) {
    return (col1.length < col2.length || (col1.length === col2.length && col1 <= col2));
  }

  incCol(col) {
    const Z = 90;
    let chars = Array.from(col);

    let rollover = false;
    let i = chars.length - 1;
    while (i >= 0) {
      let c = chars[ i ].charCodeAt(0);
      c++;
      if (c <= Z) {
        chars[ i ] = String.fromCharCode(c);
        rollover = false;
        break;
      }
      else {
        chars[ i ] = 'A';
        rollover = true;
      }
      --i;
    }

    if (rollover)
      chars.push('A');
    return chars.join("");
  }

  inCellRange(rowlen) {
    return (rowlen >= this.cells.min && rowlen <= this.cells.max) || (rowlen === this.cells.heading);
  }

  /**
   * Performs row filtering.
   *
   * @param {*} row is an array of data values
   * @returns {boolean} row passed filtering checks
   */
  process(row) {
    if (!this.headingFound) {
      this.headingFound = this.compareHeading(row, this.options.heading);
    }
    else if (!this.tableFound) {
      this.tableFound = this.inCellRange(row.length);
    }
    else if (this.options.heading && !this.tableDone) {
      this.tableDone = !this.inCellRange(row.length) || this.compareHeading(row, this.options.stopHeading);
    }

    let forward = this.headingFound && this.tableFound && !this.tableDone && this.inCellRange(row.length);

    if (forward && (this.options.repeatingHeaders || this.options.repeating)) {
      // skip repeating header rows
      if (!this._headersRow)
        this._headersRow = row;
      else
        forward = !this.rowsEqual(this._headersRow, row);
    }

    return forward;
  }

  /**
   * Emits or appends data to output.
   *
   * @param {*} row is an array of data values
   */
  async output(row) {
    this.count++;
    //// console.debug("parser output " + this.count);

    if (this.listenerCount("data") > 0) {
      this.emit("data", row);
    }
    else
      this.rows.push(row);
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

};
