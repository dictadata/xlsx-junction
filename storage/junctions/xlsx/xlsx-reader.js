/**
 * xlsx/reader
 */
"use strict";

const { StorageReader, StoragError } = require('@dictadata/storage-junctions');
const { logger } = require("@dictadata/storage-junctions/utils");

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

    this.workbook = storageJunction.workbook;
    this.sheetName = storageJunction.sheetName;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('XlsxReader _read');
    let options = this.options;

    // suggested to read up to size constructs
    // we'll ignore and push all rows from sheet
    try {
      logger.debug(JSON.stringify(this.workbook.SheetNames, null, 2));
      var worksheet = this.workbook.Sheets[this.sheetName];
      if (!worksheet)
        throw (new StorageError({ statusCode: 404, message: "sheet not found: " + this.sheetName }));

      if (this.options.cells) {
        for (let [address, cell] of Object.entries(worksheet)) {
          let construct = { address: address, cell: cell };
          this.push(construct);
        }
      }
      else {
        let constructs = XlsxSheets.sheet_to_json(worksheet, this.options.sheet_to_json);

        var max = options.max_read ? Math.min(options.max_read, constructs.length) : constructs.length;
        for (let i = 0; i < max; i++)
          this.push(constructs[i]);
      }

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      //logger.error(err);
      //this.push(null);
      throw err;
    }

  }

};
