/**
 * lib/RowAsObjectTransform.js
 */
"use strict";

const { Transform } = require('stream');

/**
 * Transforms row data to JSON objects.
 */
module.exports = exports = class RowAsObjectTransform extends Transform {

  /**
   *
   * @param {object}  options
   * @param {Boolean} options.hasHeader data has a header row
   * @param {Array}   options.headers   array of field names for construct, default none, first table row contains names.
   */
  constructor(options = {}) {
    let streamOptions = {
      objectMode: true
    };
    super(streamOptions);

    this.hasHeader = options.RowAsObject?.hasHeader || options[ "RowAsObject.hasheader" ] || options.hasHeader;
    this.headers = options.RowAsObject?.headers || options[ "RowAsObject.headers" ] || options.headers || [];

    this._headers; // internal header row
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} row
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(row, encoding, callback) {
    if (this.hasHeader && !this._headers) {
      this._headers = row;
      if (!this.headers?.length)
        this.headers = row;
    }
    else {
      let obj = {};
      for (let i = 0; i < row.length; i++) {
        let prop = this.headers[ i ] || i;
        obj[ prop ] = row[ i ];
      }
      this.push(obj);
    }
    callback();
  }

/*
  _flush(callback) {
    callback();
  }
*/
};
