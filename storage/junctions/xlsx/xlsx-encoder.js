/**
 * xlsx/encoder
 */
"use strict";

const ynBoolean = require('yn');

/**
 * convert a xlsx type to a storage type
 * returns an array with [storageType,size]
 */
var storageType = exports.storageType = function (xlsxType) {
  // b Boolean, e Error, n Number, d Date, s Text, z Stub
  // convert to storage type
  let fldType = 'undefined';
  switch (rstype.toLowerCase()) {
    case 'e': fldType = 'integer'; break;
    case 'n': fldType = 'float'; break;
    case 'b': fldType = 'boolean'; break;
    case 'd': fldType = 'date'; break;
    case 's':
    default:  fldType = 'text'; break;
  }

  return fldType;
};

/**
 * Convert a xlsx column definition to a storage field definition.
 * Assume this is a cell from the header row.
 */
exports.storageField = function (cell) {

  let field = {
    name: cell.v,
    type: storageType(cell.t),
    //size: 0,
    //default: null,
    //isNullable: true,
    //keyOrdinal: 0,

    // add additional Xlsx fields
    //_xlsx: {
    //  w: cell.w,
    //  f: cell.f
    //}
  };

  return field;
};

/**
 * return a xlsx type from a storage field definition
 */
exports.xlsxType = function (field) {
  let xlsxType = "z";

  switch (field.type) {
    case "integer":
    case "number":
      xlsxType = "n";  break;
    case "keyword":
    case "string":
    case "text":
      xlsxType = "s";  break;
    case "date":
      xlsxType = "d";  break;
    case "boolean":
      xlsxType = "b";  break;
  }

  return xlsxType;
};
