/**
 * xlsx/reader
 */
"use strict";

const { StorageReader, StorageError } = require('@dictadata/storage-junctions');

const XLSX = require('xlsx');
const XlsxSheets = require('./xlsx-sheets');

module.exports = exports = class XlsxReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    this.logger.debug('XlsxReader _read');
    let options = this.options.reader;

    // suggested to read up to size constructs
    // we'll ignore and push all rows from sheet
    try {
      let filepath = this.engram.smt.locus;
      let sheetName = this.options.sheetName || this.engram.smt.schema || "Sheet1"

      this.logger.debug("load file " + filepath)
      var workbook = XLSX.readFile(filepath, {cellDates: true});
      var worksheet = workbook.Sheets[sheetName]
      if (!worksheet)
        throw(new StorageError({StatusCode: 404, message: "sheet not found"}));

      let s_opts = _mergeOptions({}, "xlsx");
      this.ifOptions(s_opts, ["raw", "range", "header", "dateNF", "defval", "blankrows"]);

      let constructs = XlsxSheets.sheet_to_json(worksheet, s_opts);

      var max = this.options.max_read ? Math.min(this.options.max_read, constructs.length) : constructs.length;
      for (let i = 0; i < max; i++)
        this.push(constructs[i]);

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      this.logger.error(err.message);
      this.push(null);
    }

  }

};
