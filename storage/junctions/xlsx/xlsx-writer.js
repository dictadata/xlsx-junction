/**
 * xlsx/writer
 *
 */
"use strict";

const { StorageWriter } = require('@dictadata/storage-junctions');
const { logger } = require("@dictadata/storage-junctions/utils");

const XLSX = require('xlsx');
const XlsxSheets = XLSX.utils;
//const XlsxSheets = require('./xlsx-sheets');

module.exports = exports = class XlsxWriter extends StorageWriter {

  /**
   * @param {Object} junction - parent XlsxJunction
   * @param {Object} options
   * @property {Boolean} raw - constructs are worksheet raw with cell properties
   *
   * json_to_sheet()
   * https://docs.sheetjs.com/docs/api/utilities/array#array-of-objects-input
   *
   * json_to_sheet write options:
   *   "cellDates", "origin", "header", "dateNF", "skipHeader"
   */
  constructor(junction, options) {
    super(junction, options);

    this.workbook = junction.workbook;
    this.sheetName = junction.sheetName;

    this.constructs = [];
  }

/*
  async _construct(callback) {
    callback();
  }
*/

  async _final(callback) {
    logger.debug("XlsxWriter._final");

    try {
      var worksheet = {};
      if (this.options.raw) {
        for (let construct of this.constructs)
          worksheet[construct.address] = construct.cell;
      }
      else {
        // create new sheet for data
        worksheet = XlsxSheets.json_to_sheet(this.constructs, this.options);
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
      callback(this.junction.StorageError(err));
    }
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
      callback(this.junction.StorageError(err));
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
      callback(this.junction.StorageError(err));
    }
  }

};
