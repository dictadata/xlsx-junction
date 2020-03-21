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
  let rstype = '';
  let rssize = '';

  // format is usually "name(size)" e.g. "int(11)"
  let found = false;
  for (let i = 0; i < xlsxType.length; i++) {
    if (xlsxType[i] === '(')
      found = true;
    else if (xlsxType[i] === ')')
      break;
    else if (!found)
      rstype += xlsxType[i];
    else
      rssize += xlsxType[i];
  }

  let size = parseInt(rssize);

  // convert to storage type
  let fldType = 'undefined';
  switch (rstype.toUpperCase()) {
    case 'SMALLINT':
    case 'INT2':
    case 'INTEGER':
    case 'INT':
    case 'INT4':
      fldType = 'integer';
      break;

    case 'REAL':
    case 'FLOAT4':
    case 'DOUBLE PRECISION':
    case 'FLOAT':
    case 'FLOAT8':
      fldType = 'float';
      break;

    case 'BOOLEAN':
    case 'BOOL':
      fldType = 'boolean';
      break;

    case 'CHAR':
    case 'CHARACTER':
    case 'NCHAR':
    case 'BPCHAR':
    case 'VARCHAR':
    case 'CHARACTER VARYING':
    case 'NVARCHAR':
    case 'TEXT':
    case 'DECIMAL':  // odd balls
    case 'NUMERIC':
    case 'BIGINT':
    case 'INT8':
      fldType = 'text';
      break;

    case 'DATE':
    case 'TIMESTAMP':
    case 'TIMESTAMP WITHOUT TIME ZONE':
    case 'TIMESTAMPTZ':
    case 'TIMESTAMP WITH TIME ZONE':
      fldType = 'date';
      break;

  }

  return [fldType, size];
};

/**
 * convert a xlsx column definition to a storage field definition
 */
exports.storageField = function (column) {

  let [fldType,size] = storageType(column.TYPE_NAME);

  let field = {
    name: column.COLUMN_NAME,
    type: fldType,
    size: size || column.COLUMN_SIZE,
    default: column.COLUMN_DEF || null,
    isNullable: ynBoolean(column.NULLABLE) || false,
    isKey: false,

    // add additional Xlsx fields
    _model_xlsx: {
      TYPE_NAME: column.TYPE_NAME,
      REMARKS: column.REMARKS
    }
  };

  return field;
};

/**
 * return a xlsx type from a storage field definition
 */
exports.xlsxType = function (field) {
  let xlsxType = "VARCHAR(32)";

  if (field._model_xlsx) {
    xlsxType = field._model_xlsx.Type;
  }
  else {
    switch (field.type) {
      case "boolean":
        xlsxType ="BOOL";
        break;
      case "integer":
        xlsxType ="INT";
        break;
      case "float":
        xlsxType ="FLOAT";
        break;
      case "keyword":
        xlsxType ="VARCHAR(" + (field.size || 64) + ")";
        break;
      case "text":
        xlsxType ="VARCHAR(" + (field.size || 1024) + ")";
        break;
      case "date":
        xlsxType ="DATE";
        break;
    }
  }

  return xlsxType;
};
