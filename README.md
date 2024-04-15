# @dictadata/xlsx-junction 1.8.x

A Storage Junction for Excel .xlsx and .xls files.

## Installation

npm i @dictadata/xlsx-junction

## Using the Plugin

Register the junction when initializing the app.

```javascript
const { Storage } = require("@dictadata/storage-junctions");
const { XlsxJunction } = require("@dictadata/xlsx-junction");

Storage.Junctions.use("xlsx", XlsxJunction);
Storage.Junctions.use('xls', XlsxJunction);
Storage.Junctions.use('ods', XlsxJunction);
```

Then a junction can be created as needed in the app using an SMT definition.

```javascript
const Storage = require("@dictadata/storage-junctions");

var junction = Storage.activate({
    model:"xlsx",
    locus: "file:folderpath/workbook.xlsx",
    schema: "sheet name",
    key: "column name"
  }, options);
```
## Supported Methods

- list() - list sheets
- createSchema() - create a new sheet
- dullSchema() - delete a sheet
- getEncoding() - *use codify transform to generate schema encoding
- createReader() - read rows from sheet
- createWriter() - save constructs to sheet

## Supported FileSystems

Supported filesystem are those built into the storage-junctions library.  Currently the supported filesystems types are:

- file: - local file system

## Project Dependencies
---

This storage-junction is powered by SheetsJS js-xlsx library.

* [SheetJS Project](https://docs.sheetjs.com/)

## XlsxJunction Options

```
/**
 * @param {String|Object} SMT 'xlsx|file:filename|sheetname|key' or an Engram object
 * @param {Object} options
 * @property {Boolean} raw - output all raw in worksheet with cell properties
 * @property {Boolean} overwrite - overwrite/create workbook file
 * @property {String} sheetName - sheet name to use instead of SMT.schema
 * @property {Boolean} cellDates - default true
 * @property {Boolean} cellNF - default true
 * @property {Boolean} cellStyles - default true
 *
 * XLSX.readFile()
 * read workbook options:
 *   "cellFormula", "cellHTML", "cellNF", "cellStyles", "cellText", "cellDates"
 *   https://docs.sheetjs.com/docs/api/parse-options
 *
 * XLSX.writeFile()
 * write workbook options:
 *   "cellDates", "type", "bookSST", "bookType", "sheet", "compression", "Props", "themeXLSX", "ignoreEC"
 *   https://docs.sheetjs.com/docs/api/write-options
 */
```

## XlsxReader Options

```
/**
 * @param {Object} junction - parent XlsxJunction
 * @param {Object} options
 * @property {Boolean} raw - output all raw in worksheet with cell properties
 * @property {Number} max_read - maximum rows to read
 *
 * sheet_to_json() read options:
 *   "raw", "range", "header", "dateNF", "defval", "blankrows", "skipHidden", "UTC"
 *   https://docs.sheetjs.com/docs/api/utilities/array#array-output
 */
```

## XlsxWriter Options

```
/**
 * @param {Object} junction - parent XlsxJunction
 * @param {Object} options
 * @property {Boolean} raw - output all raw in worksheet with cell properties
 *
 * json_to_sheet() write options:
 *   "cellDates", "origin", "header", "dateNF", "skipHeader"
 *   https://docs.sheetjs.com/docs/api/utilities/array#array-of-objects-input
 */
```
