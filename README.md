# @dictadata/xlsx-junction 0.9.x

A Storage Junction for Excel .xlsx and .xls files.
XlsxJunction implements a junction for reading tabular data from Excel .xlsx, .xls, .ods files.  XlsxJunction is a storage plugin for use with [_@dictadata/storage-junctions_](https://github.com/dictadata/storage-junctions) and related projects [_@dictadata/storage-tracts_](https://github.com/dictadata/storage-tracts) ETL command line utility and [_@dictadata/storage-node_](https://github.com/dictadata/storage-node) API Server.

The plugin uses the [SheetJS XLSX](https://docs.sheetjs.com/) module to parse the XLSX documents.

## Installation

```bash
npm install @dictadata/storage-junctions @dictadata/xlsx-junction
```

## Using the Plugin

Register the junction when initializing the app. Import the _Storage Junctions_ library and the _XLSX Junction_ plugin.  Then register _XLSX Junction_ with the _Storage Junctions_' `Storage` module. This will register _XLSX Junction_ for use with storage model `"xlsx"`.

```javascript
const { Storage } = require("@dictadata/storage-junctions");
const { XlsxJunction } = require("@dictadata/xlsx-junction");

Storage.Junctions.use("xlsx", XlsxJunction);
Storage.Junctions.use('xls', XlsxJunction);
Storage.Junctions.use('ods', XlsxJunction);
```

## Creating an instance of PDFJunction

Create an instance of `XLSXJunction` class. Then a junction can be created as needed in the app using an SMT definition.

```javascript
const Storage = require("@dictadata/storage-junctions");

var junction = Storage.activate("xlsx|file:folderpath/workbook.xlsx|sheet name|*", options);

// or

var junction = Storage.activate({
    model:"xlsx",
    locus: "file:folderpath/workbook.xlsx",
    schema: "sheet name",
    key: "column name"
  }, options);
```

## Supported Storage Junction Methods

- list() - list sheets
- createSchema() - create a new sheet
- dullSchema() - delete a sheet
- getEngram() - *use codify transform to generate schema encoding
- createReader() - read rows from sheet
- createWriter() - save constructs to sheet

## Supported FileSystems

Supported filesystem are those built into the storage-junctions library.  Currently the supported file systems types are:

- file: - the spreadsheet file must be located on a local file system

## Storage Junction Objects

---

### XlsxJunction Options

```javascript
/**
 * @param {String|Object} SMT 'xlsx|file:filename|sheetname|key' or an Engram object
 * @param {object} options
 * @param {boolean} [raw] - output all raw in worksheet with cell properties
 * @param {string}  [range] - A1-style range, e.g. "A3:M24"
 * @param {boolean} [overwrite] - overwrite/create workbook file
 * @param {string}  [sheetName] - sheet name to use instead of SMT.schema, default none
 * @param {boolean} [cellDates] - default true, format date cell values as UTC strings
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

### XlsxReader Options

```javascript
/**
 * @param {object} junction - parent XlsxJunction
 * @param {object}   [options]
 * @param {number}   [options.count] - maximum rows to read
 * @param {boolean}  [options.raw] - output all raw in worksheet with cell properties
 * @param {string}   [options.range] - A1-style range, e.g. "A3:M24"
 * @param {string}   [options.heading] PDF section heading where data is located, default: none
 * @param {string}   [options.stopHeading] PDF section heading after data table, default: none
 * @param {number}   [options.cells] minimum number of cells in a row, default: 1
 * @param {boolean}  [options.repeating] indicates if table headers are repeated on each page, default: false
 * @param {string[]} [options.headers] - RowAsObject: array of column names for data, default none, first table row contains names.
 * @param {number}   [options.column] - RepeatCellTransform: column index of cell to repeat, default 0
 * @param {string}   [options.header] - RepeatHeadingTransform: column name for the repeating heading field
 *
 * sheet_to_json() read options:
 *   "raw", "range", "header", "dateNF", "defval", "blankrows", "skipHidden", "UTC"
 *   https://docs.sheetjs.com/docs/api/utilities/array#array-output
 */
```

### XlsxWriter Options

```javascript
/**
 * @param {object}  junction - parent XlsxJunction
 * @param {object}  [options]
 * @param {boolean} [raw] - constructs are worksheet cells with cell properties
 *
 * json_to_sheet() write options:
 *   "cellDates", "origin", "header", "dateNF", "skipHeader"
 *   https://docs.sheetjs.com/docs/api/utilities/array#array-of-objects-input
 */
```

## Examples

---

The following examples use the State_Voter_Registration_2024_PPE.xlsx file found in the project's test/data/input folder.
Examples use [Storage Tracts](https://github.com/dictadata/storage-tracts) CLI options format to define a tract fiber.

### Output Raw Cell Properties

```javascript
{
  origin: {
    smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
    options: {
      raw: true,
      cellDates: false
    }
  },
  terminal: {
    smt: "json|./test/data/output/xlsx/|svr_all_rows.json|*"
  }
}
```

### Normalize a Missing Cell Value

```javascript
{
  origin: {
    smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
    options: {
      heading: "Active",
      cells: 9,
      column: 0
    }
  },
  terminal: {
    smt: "json|./test/data/output/xlsx/|svr_heading.json|*"
  }
}
```

### Parsing a Worksheet Range

Retrieves the same data table as previous example.

```javascript
{
  origin: {
    smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
    options: {
      range: "A6:R70",
      column: 0
    }
  },
  terminal: {
    smt: "json|./test/data/output/xlsx/|svr_range.json|*"
  }
}
```

### Normalizing a Worksheet with Subsection Headings

```javascript
{
  origin: {
    smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
    options: {
      range: "A77:S134",
      header: "County:1"
    }
  },
  terminal: {
    smt: "json|./test/data/output/xlsx/|svr_repeat.json|*"
  }
}
```
