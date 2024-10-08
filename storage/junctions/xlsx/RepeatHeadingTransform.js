/**
 * lib/RepeatHeadingTransform.js
 *
 * Repeat a subheading cell in following rows.
 * Subheadings are rows containing a single cell interspersed in data rows.
 *
 * The options.header name is inserted in to the header row.
 * The subheading value is inserted into data rows.
 */
"use strict";

const { Transform } = require('stream');
const { logger } = require('@dictadata/lib');

module.exports = exports = class RepeatHeadingTransform extends Transform {

  /**
   * Repeat a subheading cell in following rows.
   * @param {object}  options
   * @param {string}  options.header header name inserted into header row, use suffix :n:m to specify insert index in row.
   * @param {boolean} options.hasHeader data has a header row, default true
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true
    };
    super(streamOptions);

    this.options = Object.assign({}, options);

    let header = options.RepeatHeading?.header || options[ "RepeatHeading.header" ] || options.header || "subheading";
    let cols = header.split(":");
    this.header = cols[ 0 ];
    this.headerIndex = (cols.length > 1) ? cols[ 1 ] : 0;
    this.dataIndex   = (cols.length > 2) ? cols[ 2 ] : (this.headerIndex || 0);

    if (options.RepeatHeading && Object.hasOwn(options.RepeatHeading, "hasHeader"))
      this.hasHeader = options.RepeatHeading.hasHeader;
    else if (Object.hasOwn(options, "RepeatHeading.hasHeader"))
      this.hasHeader = options[ "RepeatHeading.hasHeader" ];
    else if (Object.hasOwn(options, "hasHeader"))
      this.hasHeader = options.hasHeader;
    else
      this.hasHeader = true

    this.subheading = "";
    this.count = 0;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} row
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(row, encoding, callback) {
    this.count++;
    if (row.length === 1) {
      // save value of subheading
      this.subheading = row[ 0 ];
    }
    else {
      if (this.count === 1 && this.hasHeader)
        // insert header into headers row
        row.splice(this.headerIndex, 0, this.header);
      else
        // insert heading into data rows
        row.splice(this.dataIndex, 0, this.subheading);
      this.push(row);
    }

    callback();
  }

  _flush(callback) {
    callback();
  }
};
