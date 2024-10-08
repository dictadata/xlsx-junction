/**
 * xlsx/reader
 *
 */
"use strict";

const { StorageReader } = require('@dictadata/storage-junctions');
const { StorageError } = require('@dictadata/storage-junctions/types');
const { logger } = require('@dictadata/lib');
const { pipeline } = require('node:stream/promises');

const XlsxDataReader = require('./XlsxDataReader');
const RowAsObjectTransform = require('./RowAsObjectTransform');
const RepeatCellTransform = require('./RepeatCellTransform');
const RepeatHeadingTransform = require('./RepeatHeadingTransform');

module.exports = exports = class XlsxReader extends StorageReader {

  /**
   * @param {object}   junction - parent XlsxJunction
   * @param {object}   [options]
   * @param {number}   [options.count]        maximum rows to read
   * @param {string}   [options.range]        data selection, A1-style range, e.g. "A3:M24", default all rows/columns
   * @param {integer|string} [options.cells]  minimum number cells in a row for output, or "min-max" e.g. "7-9"
   * @param {boolean}  [options.missingCells] insert null values for missing cells
   * @param {string}   [options.heading]      PDF section heading or text before data table, default: none
   * @param {string}   [options.stopHeading]  PDF section heading or text after data table, default: none
   * @param {boolean}  [options.repeating]    indicates if table headers are repeated on each page, default: false
   * @param {boolean}  [options.raw]          read raw cell properties, default false
   * @param {boolean}  [options.hasHeader]  RowAsObject.hasHeader: data has a header row
   * @param {string[]} [options.headers]    RowAsObject.headers: array of column names for data, default none, first table row contains names.
   * @param {number}   [options.column]     RepeatCellTransform.column: column index in row of cell to repeat, default 0
   * @param {string}   [options.header]     RepeatHeadingTransform.header: field name to use for repeated heading, use suffix of :n to specify insert index (column)
   */
  constructor(junction, options) {
    super(junction, options);

    if (!options.raw && !options.headers && options.encoding)
      this.options.headers = this.engram.names;

    this.workbook = junction.workbook;
    this.sheetName = options.sheetName || junction.sheetName;

    this.worksheet;
    this.started = false;
    this.pipes = [];
  }

  async _construct(callback) {
    logger.debug(JSON.stringify(this.workbook.SheetNames, null, 2));

    try {
      this.worksheet = this.workbook.Sheets[ this.sheetName ];
      if (!this.worksheet) {
        callback(this.junction.StorageError(404, "sheet not found: " + this.sheetName));
        return;
      }

      let xlsxOptions = Object.assign({}, this.options, { worksheet: this.worksheet });
      this.xlsxReader = new XlsxDataReader(xlsxOptions);
      this.pipes.push(this.xlsxReader);

      if ((this.options.RepeatCell && Object.hasOwn(this.options.RepeatCell, "column")) || Object.hasOwn(this.options, "RepeatCell.column") || Object.hasOwn(this.options, "column")) {
        let transform = new RepeatCellTransform(this.options);
        this.pipes.push(transform);
      }

      if (this.options.RepeatHeading?.header || this.options["RepeatHeading.header"] || this.options.header) {
        let transform = new RepeatHeadingTransform(this.options);
        this.pipes.push(transform);
      }

      let rowAsObject = new RowAsObjectTransform(this.options);
      this.pipes.push(rowAsObject);

      var encoder = this.junction.createEncoder(this.options);

      var reader = this;
      var _stats = this._stats;
      var count = this.options?.pattern?.count || this.options?.count || -1;

      rowAsObject.on('data', async (row) => {
        // console.debug("XlsxReader data " + _stats.count);

        if (row) {
          // use junction's encoder functions
          let construct = encoder.cast(row);
          construct = encoder.filter(construct);
          construct = encoder.select(construct);
          //logger.debug(JSON.stringify(construct));
          if (!construct)
            return;

          await this.output(construct);

          if (count > 0 && _stats.count >= count) {
            // console.debug("XlsxReader count limit reached");
            this.xlsxReader.destroy();
            reader.push(null);
          }
        }
      });

      rowAsObject.on('end', () => {
        // console.debug("XlsxReader end");
        reader.push(null);
      });

      rowAsObject.on('error', function (err) {
        // console.debug("XlsxReader error");
        logger.error(err);

        //throw new StorageError(err);
      });

    }
    catch (err) {
      logger.warn(err);
      this.destroy(this.junction.StorageError(err));
    }

    callback();
  }

  /**
   * waiting on output helps with node micro-tasking
   * @param {*} construct
   */
  async output(construct) {

    this._stats.count += 1;
    if (!this.push(construct)) {
      this.xlsxReader.pause();  // If push() returns false then pause reading from source.
    }

    if (this._stats.count % 100000 === 0)
      logger.verbose(this._stats.count + " " + this._stats.interval + "ms");
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('XlsxReader _read');

    // suggested to read up to size constructs
    // we'll ignore and push all rows from sheet
    try {
      if (this.options.raw) {
        for (let [ address, cell ] of Object.entries(this.worksheet)) {
          let construct = { address, cell };
          this.push(construct);
        }
        // done reading from source
        this.push(null);
      }
      else if (!this.started) {
        this.started = true;
        pipeline(this.pipes);
      }
      else {
        this.xlsxReader.resume();
      }
    }
    catch (err) {
      logger.warn(err);
      throw this.junction.StorageError(err);
    }

  }

};
