/**
 * xlsx/reader
 */
"use strict";

const { StorageReader, StorageError } = require('@dictadata/storage-junctions');
const logger = require("../logger");

const XLSX = require('xlsx');
const XlsxSheets = require('./xlsx-sheets');

module.exports = exports = class XlsxReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('XlsxReader._read');
    let options = this.options;

    // suggested to read up to size constructs
    // we'll ignore and push all rows from sheet
    try {
      let filepath = this.engram.smt.locus;
      let sheetName = (options.xlsx && options.xlsx.sheetName) || this.engram.smt.schema || "Sheet1"

      logger.debug("load file " + filepath)
      var workbook = XLSX.readFile(filepath, {cellDates: true});
      var worksheet = workbook.Sheets[sheetName]
      if (!worksheet)
        throw(new StorageError({StatusCode: 404, message: "sheet not found"}));

      let s_opts = Object.assign({}, (options.xlsx && options.xlsx.sheet));
      // ["raw", "range", "header", "dateNF", "defval", "blankrows"]);
      let constructs = XlsxSheets.sheet_to_json(worksheet, s_opts);

      var max = options.max_read ? Math.min(options.max_read, constructs.length) : constructs.length;
      for (let i = 0; i < max; i++)
        this.push(constructs[i]);

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      logger.error(err.message);
      this.push(null);
    }

  }

};
