/**
 * xlsx/junction
 */
"use strict";

const { StorageJunction, StorageResults, StorageError, Engram } = require('@dictadata/storage-junctions');

const XlsxReader = require("./reader");
const XlsxWriter = require("./writer");
const encoder = require("./encoder");

const XLSX = require('xlsx');
const XlsxSheets = require('./xlsx-sheets');

const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);


module.exports = exports = class XlsxJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'xlsx|file:filepath|filename|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);
    this.logger.debug("XlsxJunction");

    this._readerClass = XlsxReader;
    this._writerClass = XlsxWriter;

  }


  async relax() {
    this.logger.debug("XlsxJunction relax");

    // release any resources

  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {
    this.logger.debug("XlsxJunction getEncoding");

    try {
      // fetch encoding form storage source
      if (!this.engram.defined) {
        // read some rows from sheet to infer data types
        // could possibly read types from sheet,
        // but individual cells can have formats that differ from others in the column
        let reader = this.getReadStream(this.options.reader || { max_read: 100 });
        let codify = this.getCodifyWriter(this.options.codify || {});

        await pipeline(reader, codify);
        let encoding = await codify.getEncoding();
        this.engram.replace(encoding);
      }
      return this.engram;
    }
    catch (err) {
      if (err)
        return 'error result';

      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    this.logger.debug("XlsxJunction putEncoding");

    try {
      // possible steps
      // create sheet, if needed
      // write column headings

      this.engram.replace(encoding);
      return this.engram;
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, options = null) {
    this.logger.debug("XlsxJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");
    if (typeof construct !== "object")
      throw new StorageError({statusCode: 400}, "Invalid parameter: construct is not an object");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      // find row in sheet or append row
      let found = false
      // update row

      // check if row was inserted
      return new StorageResults( (found) ? "updated" : "appended");
    }
    catch(err) {
      if (err) {
        return new StorageResults('error', null, null, err);
      }

      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async recall(options = null) {
    this.logger.debug("XlsxJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      // find row in sheet
      // build the construct
      let construct = {};

      return new StorageResults( (found) ? "ok" : "not found", construct);
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options = null) {
    this.logger.debug("XlsxJunction retrieve");
    let pattern = options && (options.pattern || options || {});

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let constructs = [];
      // scan rows in sheet
        // if match add to constructs

      return new StorageResults((rows.length > 0) ? "retreived" : "not found", construct);
    }
    catch(err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(options = null) {
    this.logger.debug("XlsxJunction dull");
    if (!options) options = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError({ statusCode: 400 }, "unique keys not supported");

    try {
      if (Object.keys(this.engram.fields).length == 0)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'list' || this.engram.keyof === 'all') {
        // delete rows in sheet that match pattern

      }
      else {
        // delete all rows in the sheet

      }

      return new StorageResults((results.count > 0) ? "ok" : "not found", null, null, results);
    }
    catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }

};
