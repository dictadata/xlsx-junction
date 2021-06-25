/**
 * xlsx/writer
 */
"use strict";

const { StorageWriter, StorageError } = require('@dictadata/storage-junctions');
const { logger } = require("@dictadata/storage-junctions/utils");

const XLSX = require('xlsx');
const XlsxSheets = require('./xlsx-sheets');

module.exports = exports = class XlsxWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.workbook = storageJunction.workbook;
    this.sheetName = storageJunction.sheetName;

    this.constructs = [];
  }

  async _write(construct, encoding, callback) {
    logger.debug("XlsxWriter._write");
    logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // collect constructs in memory
      this._count(1);
      this.constructs.push(construct);

      callback();
    }
    catch (err) {
      logger.error(err);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("XlsxWriter._writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to .schema
        await this._write(construct, encoding, () => {});
      }
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }
  }

  async _final(callback) {
    logger.debug("XlsxWriter._final");

    try {
      var worksheet = {};
      if (this.options.cells) {
        for (let construct of this.constructs)
          worksheet[construct.address] = construct.cell;
      }
      else {
        // create new sheet for data
        worksheet = XlsxSheets.json_to_sheet(this.constructs, this.json_to_sheet);
      }

      if (this.workbook.SheetNames.indexOf(this.sheetName) >= 0)
        this.workbook.Sheets[this.sheetName] = worksheet;
      else
        XLSX.utils.book_append_sheet(this.workbook, worksheet, this.sheetName);
      this.junction.wbModified = true;

      // cleanup resources
      //this.constructs = [];
      this._count(null);
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error writer._final'));
    }
  }

};
