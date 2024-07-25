/**
 * test/xlsx/transfer
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/lib');
const { transfer } = require('@dictadata/storage-junctions/test');

logger.info("=== Test: xlsx");

async function tests() {

  logger.info("=== csv > xlsx");
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "xlsx|./test/data/output/xlsx/foofile_csv.xlsx|foo|*",
      options: {}
    }
  })) return 1;

  logger.info("=== xlsx > csv");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/foofile.xlsx|foo|*",
      options: {
        missingCells: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/xlsx/|foofile.csv|*",
      options: {
        header: true
      },
      output: "./test/data/output/xlsx/foofile.csv"
    }
  })) return 1;

  logger.info("=== json > xlsx");
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "xlsx|./test/data/output/xlsx/foofile_json.xlsx|foo|*",
      options: {}
    }
  })) return 1;

  logger.info("=== xls > json");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/foofile.xls|foo|*",
      options: {
        missingCells: true
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|foofile.json|*",
      options: {},
      output: "./test/data/output/xlsx/foofile.json"
    }
  })) return 1;

}

(async () => {
  await tests();
})();
