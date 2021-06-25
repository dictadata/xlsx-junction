/**
 * test/xlsx/transfer
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/storage-junctions/utils');
const { transfer, dullSchema } = require('@dictadata/storage-junctions/test');

logger.info("=== Test: xlsx");


async function tests() {

  logger.info("=== csv > xlsx");
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "xlsx|./data/output/xlsx/foofile_csv.xlsx|foo|*",
      options: {}
    }
  })) return 1;

  logger.info("=== xlsx > csv");
  if (await transfer({
    origin: {
      smt: "xlsx|./data/test/foofile.xlsx|foo|*",
      options: {}
    },
    terminal: {
      smt: "csv|./data/output/xlsx/|foofile.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.info("=== json > xlsx");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "xlsx|./data/output/xlsx/foofile_json.xlsx|foo|*",
      options: {}
    }
  })) return 1;

  logger.info("=== xls > json");
  if (await transfer({
    origin: {
      smt: "xlsx|./data/test/foofile.xls|foo|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/xlsx/|foofile.json|*",
      options: {}
    }
  })) return 1;

}

(async () => {
  await tests();
})();
