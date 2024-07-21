/**
 * xlsx/junction
 *
 */
"use strict";

const { Storage, StorageJunction } = require("@dictadata/storage-junctions");
const { Fields, StorageResults, StorageError } = require("@dictadata/storage-junctions/types");
const { logger } = require("@dictadata/lib");
const { typeOf } = require("@dictadata/lib");

const XlsxReader = require("./xlsx-reader");
const XlsxWriter = require("./xlsx-writer");
//const XlsxEncoder = require("./xlsx-encoder");

const XLSX = require('xlsx');

const fs = require('node:fs');
const { arrayBuffer } = require('node:stream/consumers');

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
   * @param {object}  [options]
   * @param {boolean} [options.create]    - create workbook if it doesn't exist, default false
   * @param {boolean} [options.save]      - save workbook if modified, default false
   * @param {string}  [options.sheetName] - sheet name to use instead of SMT.schema, default none
   * @param {string}  [options.range]     - data selection, A1-style range, e.g. "A3:M24", default all rows/columns
   * @param {boolean} [options.cellDates] - default true, format date cell values as UTC strings
   * @param {boolean} [options.raw]       - read/write raw cell properties, default false
   *
   * XLSX.readFile() options:
   * https://docs.sheetjs.com/docs/api/parse-options
   *
   * XLSX.writeFile() options:
   * https://docs.sheetjs.com/docs/api/write-options
   *
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("XlsxJunction");

    this.filepath = this.smt.locus;
    this.sheetName = this.options.sheetName || this.engram.smt.schema || "Sheet1";

    this.workbook = null;
    this.wbModified = false;

    this.options = Object.assign({
      raw: false,
      cellFormula: false, // .f
      cellHTML: false, // .h
      cellNF: true, // .z Number (cell) Format
      cellStyles: false, // .s
      cellText: true,  // .w
      cellDates: true // t:"d" and .v as UTC date string, instead of t:"n" and v. as number
    }, this.options);

    // if encoding is supplied then use for headers
    if (options.encoding && !options.headers) {
      let fields = Fields.Convert(options.encoding.fields || options.encoding);
      this.options.headers = fields.reduce((accumulator, value) => {
        accumulator.push(value.name);
        return accumulator;
      }, [])
    }
  }

  // initialize workbook
  async activate() {
    let stfs = await Storage.activateFileSystem(this.smt, this.options);

    if (stfs.fstype === "file") {
      if (fs.existsSync(this.filepath)) {
        logger.debug("load workbook " + this.filepath);
        this.workbook = XLSX.readFile(this.filepath, this.options);
      }
      else if (this.options.create) {
        logger.debug("new workbook");
        this.workbook = XLSX.utils.book_new();
      }
      else {
        throw new StorageError(404, `File Not Found: ${this.filepath}`);
      }
    }
    else {
      let rs = await stfs.createReadStream({ schema: "" });
      let buff = await arrayBuffer(rs);
      this.options.type = "buffer";
      this.workbook = XLSX.read(buff, this.options);
    }

    this._isActive = true;
  }

  async relax() {
    logger.debug("XlsxJunction relax");

    // save file
    if (this.options.save && this.wbModified) {
      logger.debug("save workbook");
      XLSX.writeFile(this.workbook, this.filepath, this.options);
    }
  }

  /**
  * Return list of sheet names found in the workbook.
  * The smt.schema or options.schema should contain a wildcard character *.
  * If options.forEach is defined it is called for each schema found.
  * Returns list of schemas found.
  * @param {object} options - list options
  * @param {string} schema - search term with optional wildcards
  * @param {Function} forEach = function to call for each entry
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
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {object} options
   * @param {string} sheetName
   * @param {object} encoding
   * @param {}
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

      return new StorageResults(0);
    }
    catch (err) {
      logger.error(err);
      throw this.StorageError(err);
    }
  }

  /**
   * Dull a schema at the locus.
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {object} options
   * @param {string} sheetName name to use instead of junction's smt.schema
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
        await this.getEngram();

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
        await this.getEngram();

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
   * @param {object} pattern
   */
  async retrieve(pattern) {
    logger.debug("XlsxJunction retrieve");
    let storageResults = new StorageResults("list");
    let rs = this.createReader(pattern);

    rs.on('data', (chunk) => {
      storageResults.add(chunk);
    })
    rs.on('end', () => {
      // console.log('There will be no more data.');
    });
    rs.on('error', (err) => {
      storageResults = this.StorageError(err);
    });

    await finished(rs);

    return storageResults;
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
        await this.getEngram();

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
