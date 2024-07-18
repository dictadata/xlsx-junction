/**
 * xlsx/reader
 *
 */
"use strict";

const { StorageReader } = require('@dictadata/storage-junctions');
const { StorageError } = require('@dictadata/storage-junctions/types');
const { logger } = require('@dictadata/lib');
const { pipeline } = require('node:stream/promises');

const XlsxSheetReader = require('./xlsx-sheet-reader');
const RowAsObjectTransform = require('./RowAsObjectTransform');
const RepeatCellTransform = require('./RepeatCellTransform');
const RepeatHeadingTransform = require('./RepeatHeadingTransform');

module.exports = exports = class XlsxReader extends StorageReader {

  /**
   * @param {object}   junction - parent XlsxJunction
   * @param {object}   [options]
   * @param {number}   [options.count] - maximum rows to read
   * @param {boolean}  [options.raw]   - output all raw in worksheet with cell properties
   * @param {string[]} [options.headers] - RowAsObject.headers: array of column names for data, default none, first table row contains names.
   * @param {number}   [options.column]  - RepeatCellTransform.column: column index of cell to repeat, default 0
   * @param {string}   [options.header]  - RepeatHeadingTransform.header: column name for the repeating heading field
   */
  constructor(junction, options) {
    super(junction, options);

    this.workbook = junction.workbook;
    this.sheetName = junction.sheetName;

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

      let xlsxReader = new XlsxSheetReader(this.worksheet, this.options);
      this.pipes.push(xlsxReader);

      if (Object.hasOwn(this.options, "RepeatCell.column") || Object.hasOwn(this.options, "column")) {
        let transform = new RepeatCellTransform(this.options);
        this.pipes.push(transform);
      }

      if (Object.hasOwn(this.options, "RepeatHeading.header") || Object.hasOwn(this.options, "header")) {
        let transform = new RepeatHeadingTransform(this.options);
        this.pipes.push(transform);
      }

      let rowAsObject = new RowAsObjectTransform(this.options);
      this.pipes.push(rowAsObject);

      var encoder = this.junction.createEncoder(this.options);

      var reader = this;
      var _stats = this._stats;
      var count = this.options?.pattern?.count || this.options?.count || -1;

      rowAsObject.on('data', (row) => {
        if (row) {
          // use junction's encoder functions
          let construct = encoder.cast(row);
          construct = encoder.filter(construct);
          construct = encoder.select(construct);
          //logger.debug(JSON.stringify(construct));

          if ((_stats.count + 1) % 10000 === 0) {
            logger.verbose(_stats.count + " " + _stats.interval + "ms");
          }

          if (count > 0 && _stats.count > count) {
            reader.push(null);
            xlsxReader.destroy();
          }
          else if (construct) {
            _stats.count += 1;
            if (!reader.push(construct)) {
              //rowpause();  // If push() returns false stop reading from source.
            }
          }
        }
      });

      rowAsObject.on('end', () => {
        reader.push(null);
      });

      rowAsObject.on('error', function (err) {
        throw new StorageError(err);
      });

    }
    catch (err) {
      logger.warn(err);
      this.destroy(this.junction.StorageError(err));
    }

    callback();
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
    }
    catch (err) {
      logger.warn(err);
      throw this.junction.StorageError(err);
    }

  }

};
