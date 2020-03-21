/**
 * xlsx/reader
 */
"use strict";

const { StorageReader, StorageError } = require('@dictadata/storage-junctions');

const XLSX = require('xlsx');
const sheets = require('./sheets');

module.exports = class XlsxReader extends StorageReader {

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
    this._logger.debug('XlsxReader _read');

    // suggested to read up to size constructs
    // we'll ignore and push all rows from sheet
    try {
      let filepath = this._engram.smt.locus;
      let sheetName = this._options.sheetName || this._engram.smt.schema || "Sheet1"

      console.log("load file " + filepath)
      var workbook = XLSX.readFile(filepath);
      var worksheet = workbook.Sheets[sheetName]
      if (!worksheet)
        throw(new StorageError({StatusCode: 404, message: "sheet not found"}));

      let constructs = sheets.sheet_to_json(worksheet);

      for (let i = 0; i < constructs.length; i++)
        this.push(constructs[i]);

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      this._logger.error(err.message);
      this.push(null);
    }

  }

};
