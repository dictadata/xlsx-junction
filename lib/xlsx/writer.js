/**
 * xlsx/writer
 */
"use strict";

const { StorageWriter, StorageError } = require('@dictadata/storage-junctions');

const XLSX = require('xlsx');
const XlsxSheets = require('./xlsx-sheets');

module.exports = exports = class XlsxWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);
    this.constructs = [];
  }

  ifOptions(dst, names) {
    if (!Array.isArray(names))
      names = [names];

    for (let name of names)
      if (Object.prototype.hasOwnProperty.call(this.options, name))
        dst[name] = this.options[name];
  }

  async _write(construct, encoding, callback) {
    this.logger.debug("XlsxWriter _write");
    this.logger.debug(JSON.stringify(construct));

    try {
      // save construct to .schema
      this.constructs.push(construct);

      callback();
    }
    catch (err) {
      this.logger.error(err.message);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    this.logger.debug("XlsxWriter _writev");

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
      this.logger.error(err.message);
      callback(err);
    }
  }

  _final(callback) {

    try {
      let filepath = this.engram.smt.locus;
      let sheetName = this.options.sheetName || this.engram.smt.schema || "Sheet1"

      this.logger.debug("save file " + filepath)

      var workbook = XLSX.utils.book_new();

      let s_opts = {
        cellDates: Object.prototype.hasOwnProperty.call(this.options,"cellDates") ? this.options.cellDates : true
      }
      this.ifOptions(s_opts, ["origin", "header", "dateNF", "skipHeader"]);

      var worksheet = XlsxSheets.json_to_sheet(this.constructs, s_opts);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      let f_opts = {
        cellDates: true
      }
      this.ifOptions(f_opts, ["type", "bookSST", "bookType", "sheet", "compression", "Props", "themeXLSX", "ignoreEC"]);
      XLSX.writeFile(workbook, filepath, f_opts );

      // close connection, cleanup resources, ...
      this.constructs = [];
    }
    catch(err) {
      this.logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }
    callback();
  }

};
