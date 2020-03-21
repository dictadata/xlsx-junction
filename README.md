# @dictadata/xlsx-junction

A storage junction for Excel .xlsx and .xls files.

## Installation

npm i @dictadata/xlsx-junction

## Using the Plugin

Register the junction when initializing the app.

```javascript
const storage = require("@dictadata/storage-junctions");

const XlsxJunction = require("@dictadata/xlsx-junction");
storage.use("xlsx", XlsxJunction);
```

Then a junction can be created as needed in the app using a SMT definition.

```javascript
const storage = require("@dictadata/storage-junctions");

var junction = storage.activate({
  smt: {
    model:"xlsx",
    locus: "filesystem:folderpath",
    schema: "filename",
    key: "*"
  }
});
```

## Supported filesystems

Supported filesystem are those built into the storage-junctions library.  Currently the supported filesystems types are:

- file - local file system
- s3 - AWS S3 bucket
- ftp - FTPS server address and port

## Project Dependencies
---

This storage-junction is powered by SheetsJS js-xlsx library.

* [SheetJS js-xlsx Project](https://github.com/SheetJS/sheetjs)
* [NodeJS Server Deployments](https://github.com/SheetJS/sheetjs/tree/548396f87db576bfe2b9d80724554e51211d44f9/demos/server)
