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
  smt: {
    model:"xlsx",
    locus: "file:folderpath/workbook.xlsx",
    schema: "sheet name",
    key: "column name"
  }
});
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

* [SheetJS js-xlsx Project](https://github.com/SheetJS/sheetjs)
