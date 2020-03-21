/**
 * xlsx/writer
 */
"use strict";

const { StorageWriter, StorageError } = require('@dictadata/storage-junctions');

const XLSX = require('xlsx');
const sheets = require('./sheets');

module.exports = class XlsxWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);
    this.constructs = [];
  }

  async _write(construct, encoding, callback) {
    this._logger.debug("XlsxWriter _write");
    this._logger.debug(JSON.stringify(construct));

    try {
      // save construct to .schema
      this.constructs.push(construct);

      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    this._logger.debug("XlsxWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        //let encoding = chunks[i].encoding;  // string encoding

        // save construct to .schema
        this.constructs.push(construct);
      }
      callback();
    }
    catch (err) {
      this._logger.error(err.message);
      callback(err);
    }
  }

  _final(callback) {

    try {
      let filepath = this._engram.smt.locus;
      let sheetName = this._options.sheetName || this._engram.smt.schema || "Sheet1"

      console.log("save file " + filepath)

      var workbook = XLSX.utils.book_new();

      var worksheet = sheets.json_to_sheet(this.constructs);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      XLSX.writeFile(workbook, filepath);

      // close connection, cleanup resources, ...
      this.constructs = [];
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }
    callback();
  }

};
