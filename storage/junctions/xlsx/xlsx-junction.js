/**
 * xlsx/junction
 *
 */
"use strict";

const { StorageJunction } = require("@dictadata/storage-junctions");
const { StorageResults, StorageError } = require("@dictadata/storage-junctions/types");
const { typeOf, logger } = require("@dictadata/storage-junctions/utils");

const XlsxReader = require("./xlsx-reader");
const XlsxWriter = require("./xlsx-writer");
//const XlsxEncoder = require("./xlsx-encoder");

const XLSX = require('xlsx');
//const XlsxSheets = XLSX.utils;

const fs = require('fs');
const stream = require('stream/promises');

module.exports = exports = class XlsxJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: false, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: false,   // get encoding from source
    reader: true,     // stream reader
    writer: true,     // stream writer
    store: false,      // store/recall individual constructs
    query: false,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  //_encoderClass = XlsxEncoder;
  _readerClass = XlsxReader;
  _writerClass = XlsxWriter;

  /**
   * @param {String|Object} SMT 'xlsx|file:filename|sheetname|key' or an Engram object
   * @param {Object} options
   * @property {Boolean} raw - output all raw in worksheet with cell properties
   * @property {String} range - A1-style range, e.g. "A3:M24"
   * @property {Boolean} overwrite - overwrite/create workbook file
   * @property {String} sheetName - sheet name to use instead of SMT.schema, default none, optional
   * @property {Boolean} cellDates - default true
   * @property {Boolean} cellNF - default true
   * @property {Boolean} cellStyles - default true
   *
   * XLSX.readFile()
   * https://docs.sheetjs.com/docs/api/parse-options
   *
   * read workbook options:
   *   "cellFormula", "cellHTML", "cellNF", "cellStyles", "cellText", "cellDates"
   *
   * XLSX.writeFile()
   * https://docs.sheetjs.com/docs/api/write-options
   *
   * write workbook options:
   *   "cellDates", "type", "bookSST", "bookType", "sheet", "compression", "Props", "themeXLSX", "ignoreEC"
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("XlsxJunction");

    this.filepath = this.smt.locus;
    this.sheetName = this.options.sheetName || this.engram.smt.schema || "Sheet1";

    this.workbook = null;
    this.wbModified = false;

    if (this.options.raw)
      this.options = Object.assign({ cellDates: true, cellNF: true, cellStyles: true }, this.options);
    else
      this.options = Object.assign({ cellDates: true }, this.options);

  }

  // initialize workbook
  async activate() {
    if (fs.existsSync(this.filepath) && !this.options.overwrite) {
      logger.debug("load workbook " + this.filepath);
      this.workbook = XLSX.readFile(this.filepath, this.options);
    }
    else {
      logger.debug("new workbook");
      this.workbook = XLSX.utils.book_new();
    }

    this._isActive = true;
  }

  async relax() {
    logger.debug("XlsxJunction relax");

    // save file
    if (this.wbModified) {
      logger.debug("save workbook");
      XLSX.writeFile(this.workbook, this.filepath, this.options);
    }
  }

  /**
  * Return list of sheet names found in the workbook.
  * The smt.schema or options.schema should contain a wildcard character *.
  * If options.forEach is defined it is called for each schema found.
  * Returns list of schemas found.
  * @param {Object} options - list options
  * @property {String} schema - search term with optional wildcards
  * @property {Function} forEach = function to call for each entry
  */
  async list(options) {
    logger.debug('XlsxJunction list');
    options = Object.assign({}, this.options, options);

    let match = options.schema || this.smt.schema || '*';
    let rx = '^' + match + '$';
    rx = rx.replace('.', '\\.');
    rx = rx.replace('?', '.');
    rx = rx.replace('*', '.*');
    rx = new RegExp(rx);

    let list = [];
    for (let sheetName of this.workbook.SheetNames) {
      if (rx.test(sheetName)) {
        if (options.forEach)
          await options.forEach(sheetName);

        list.push(sheetName);
      }
    }

    return new StorageResults(0, null, list);
  }

  /**
     *  Get the encoding for the storage node.
     *  Possibly make a call to the source to acquire the encoding definitions.
     */
  async getEncoding() {
    logger.debug("XlsxJunction get encoding");

    try {
      // fetch encoding form storage source
      if (!this.engram.isDefined) {
        // read some rows from sheet to infer data types
        // could possibly read types from sheet,
        // but individual raw can have formats that differ from others in the column
        let options = Object.assign({ max_read: 100 }, this.options);
        let reader = this.createReader(options);
        let codify = this.createTransform('codify', options);

        await stream.pipeline(reader, codify);
        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }

      return new StorageResults(0, null, this.engram.encoding, "encoding");
    }
    catch (err) {
      logger.error(err);
      throw this.StorageError(err);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {Object} options
   * @property {String} sheetName
   * @property {Object} encoding
   * @property {}
   */
  async createSchema(options) {
    logger.debug("XlsxJunction createSchema");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.sheetName || options.schema || this.smt.schema;

      let encoding = options.encoding || this.engram.encoding;

      // possible steps
      // create sheet, if needed
      // write column headings

      this.engram.encoding = encoding;

      return new StorageResults(0);    }
    catch (err) {
      logger.error(err);
      throw this.StorageError(err);
    }
  }

  /**
   * Dull a schema at the locus.
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options
   * @property {String} sheetName name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('XlsxJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.sheetName || options.schema || this.smt.schema;

    throw new StorageError(501);

    //return new StorageResults(0);
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, options) {
    logger.debug("XlsxJunction store");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError(400, "unique keys not supported");
    if (typeOf(construct) !== "object")
      throw new StorageError(400, "Invalid parameter: construct is not an object");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      // find row in sheet or append row
      let resultCode = 501;
      let rowsCount = 0;

      // update row

      // check if row was inserted
      return new StorageResults(resultCode, null, rowsCount, "rowsCount");
    }
    catch (err) {
      logger.error(err);
      throw this.StorageError(err);
    }
  }

  /**
   *
   */
  async recall(options) {
    logger.debug("XlsxJunction recall");

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError(400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      // find row in sheet
      // build the construct
      let resultCode = 501;
      let construct = {};

      return new StorageResults(resultCode, null, construct);
    }
    catch (err) {
      logger.error(err);
      throw this.StorageError(err);
    }
  }

  /**
   *
   * @param {Object} options
   * @property {Object} pattern
   */
  async retrieve(options) {
    logger.debug("XlsxJunction retrieve");
    const pattern = options && (options.pattern || options || {});

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let resultCode = 501;
      let constructs = [];
      // scan rows in sheet
      // if match add to constructs

      return new StorageResults(resultCode, null, constructs);
    }
    catch (err) {
      logger.error(err);
      throw this.StorageError(err);
    }
  }

  /**
   *
   */
  async dull(options) {
    logger.debug("XlsxJunction dull");
    if (!options) options = {};

    if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
      throw new StorageError(400, "unique keys not supported");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let results = null;
      if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // delete rows in sheet that match pattern

      }
      else {
        // delete all rows in the sheet

      }

      return new StorageResults(501);
    }
    catch (err) {
      logger.error(err);
      throw this.StorageError(err);
    }
  }

};
