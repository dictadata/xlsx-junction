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

  logger.info("=== xlsx writer");
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "xlsx|DSN=drewlab|foo_transfer|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== xlsx reader");
  await transfer({
    source: {
      smt: "xlsx|DSN=drewlab|foo_transfer|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "csv|./test/output/|xlsx_output.csv|*",
      options: {
        logger: logger
      }
    }
  });
}

tests();
