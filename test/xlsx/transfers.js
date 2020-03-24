/**
 * test/xlsx/transfer
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../../lib/xlsx");

const transfer = require('../lib/_transfer');
const logger = require('../logger');

logger.info("=== Test: xlsx");

console.log("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);


async function tests() {

  logger.info("=== read csv write xlsx");
  await transfer({
    source: {
      smt: "csv|test/data/|foofile.csv|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "xlsx|test/output/csv_foofile.xlsx|foo|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== read xlsx write csv");
  await transfer({
    source: {
      smt: "xlsx|test/output/csv_foofile.xlsx|foo|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "csv|test/output/|xlsx_foofile.csv|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== read json write xlsx");
  await transfer({
    source: {
      smt: "json|test/data/|foofile.json|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "xlsx|test/output/json_foofile.xlsx|foo|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== read xlsx write json");
  await transfer({
    source: {
      smt: "xlsx|test/output/json_foofile.xlsx|foo|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "json|test/output/|xlsx_foofile.json|*",
      options: {
        logger: logger
      }
    }
  });

}

tests();
