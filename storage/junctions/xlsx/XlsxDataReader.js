
/**
 * lib/XlsxDataReader
 */
"use strict";

const XlsxDataParser = require("./XlsxDataParser");
const { Readable } = require('stream');

module.exports = class XlsxDataReader extends Readable {

  /**
   *
   * @param {object}           options
   * @param {object}           options.worksheet
   * @param {any}              see XLSXDataParser for all options
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 32,
      autoDestroy: false
    };
    super(streamOptions);

    this.options = options || {};

    this.parser;
    this.count = 0;
  }

  async _construct(callback) {
    let parser = this.parser = new XlsxDataParser(this.options);
    var reader = this;

    parser.on('data', (row) => {
      if (row) {
        this.count++;
        // console.debug("reader data " + this.count);

        if (!reader.push(row)) {  // If push() returns false stop reading from source.
          this.parser.pause();
        }
      }

    });

    parser.on('end', () => {
      // console.debug("reader end");
      reader.push(null);
    });

    parser.on('error', function (err) {
      // console.debug("reader error");
      throw err;
    });

    callback();
  }

  async _destroy(err) {
    // console.debug("reader _destroy");
    this.parser.cancel();
    if (err)
      console.error(err.message);
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    // console.debug("reader _read ");

    // ignore size
    try {
      if (!this.parser.started) {
        this.parser.parse();
      }
      else {
        this.parser.resume();
      }
    }
    catch (err) {
      this.push(null);
    }
  }

};
