/**
 * xlsx/reader
 *
 */
"use strict";

const { StorageReader } = require('@dictadata/storage-junctions');
const { logger } = require('@dictadata/storage-junctions/utils');

const XLSX = require('xlsx');
const XlsxDataParser = require('./xlsx-data-parser');

module.exports = exports = class XlsxReader extends StorageReader {

  /**
   * @param {Object} junction - parent XlsxJunction
   * @param {Object} options
   * @property {Number} max_read - maximum rows to read
   * @property {Boolean} raw - output all raw in worksheet with cell properties
   * @property {String} range - A1-style range, e.g. "A3:M24"
   * @property {String} range A1-style range, e.g. "A3:M24"
   * @property {String} heading PDF section heading where data is located, default: none
   * @property {Integer} cells minimum number of cells in a row, default: 1
   * @property {Integer} pageHeader height of page header area in rows, default: 0
   * @property {Integer} pageFooter height of page footer area in rows, default: 0
   * @property {Boolean} repeatingHeaders indicates if table headers are repeated on each page, default: false
   */
  constructor(junction, options) {
    super(junction, options);

    this.workbook = junction.workbook;
    this.sheetName = junction.sheetName;

    this.worksheet;
    this.parser;
    this.started = false;
  }

  async _construct(callback) {
    logger.debug(JSON.stringify(this.workbook.SheetNames, null, 2));

    var reader = this;
    this.worksheet = this.workbook.Sheets[ this.sheetName ];

    if (!this.worksheet) {
      callback(this.junction.StorageError(404, "sheet not found: " + this.sheetName));
      return;
    }

    let parser = this.parser = new XlsxDataParser(this.worksheet, this.options);

    parser.on('data', (row) => {
      var max = this.options.max_read ? Math.min(this.options.max_read, constructs.length) : constructs.length;

      if (row) {
        // add additional processing here

        if (!reader.push(row)) {
          //parser.pause();  // If push() returns false stop reading from source.
        }
      }

    });

    parser.on('end', () => {
      reader.push(null);
    });

    parser.on('error', function (err) {
      throw this.junction.StorageError(err);
    });

    callback();
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('XlsxReader _read');

    // suggested to read up to size constructs
    // we'll ignore and push all rows from sheet
    try {
      if (this.options.raw) {
        for (let [ address, cell ] of Object.entries(this.worksheet)) {
          let construct = { address, cell };
          this.push(construct);
        }
      }
      else {
        this.parser.parse();
      }

      // done reading from source
      this.push(null);
    }
    catch (err) {
      logger.warn(err);
      throw this.junction.StorageError(err);
    }

  }

};
