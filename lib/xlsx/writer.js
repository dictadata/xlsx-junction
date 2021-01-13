/**
 * xlsx/writer
 */
"use strict";

const { StorageWriter, StorageError } = require('@dictadata/storage-junctions');
const logger = require("../logger");

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
    this.constructs = [];
  }

  async _write(construct, encoding, callback) {
    logger.debug("XlsxWriter._write");
    logger.debug(JSON.stringify(construct));

    try {
      // save construct to .schema
      this.constructs.push(construct);

      callback();
    }
    catch (err) {
      logger.error(err.message);
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

  _final(callback) {
    logger.debug("XlsxWriter._final");
    let options = this.options;

    try {
      let filepath = this.engram.smt.locus;
      let sheetName = (options.xlsx && options.xlsx.sheetName) || this.engram.smt.schema || "Sheet1"

      logger.debug("save file " + filepath)

      var workbook = XLSX.utils.book_new();

      let s_opts = Object.assign({cellDates : true}, (options.xlsx && options.xlsx.sheet));
      // ["cellDates", "origin", "header", "dateNF", "skipHeader"]);
      var worksheet = XlsxSheets.json_to_sheet(this.constructs, s_opts);

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      let f_opts = Object.assign({cellDates: true}, (options.xlsx && options.xlsx.workbook));
      //  ["cellDates", "type", "bookSST", "bookType", "sheet", "compression", "Props", "themeXLSX", "ignoreEC"]);
      XLSX.writeFile(workbook, filepath, f_opts );

      // close connection, cleanup resources, ...
      this.constructs = [];
    }
    catch(err) {
      logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }
    callback();
  }

};
