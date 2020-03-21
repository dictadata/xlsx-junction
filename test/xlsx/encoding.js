/**
 * test/xlsx/encoding
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../../lib/xlsx");

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../logger');

logger.info("=== Test: xlsx");

console.log("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);


async function tests() {

  logger.info("=== xlsx putEncoding");
  await putEncoding({
    source: {
      smt: "xlsx|DSN=drewlab|foo_schema|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== xlsx getEncoding");
  await getEncoding({
    source: {
      smt: "xlsx|DSN=drewlab|foo_schema|*",
      options: {
        logger: logger
      }
    },
    OutputFile: './test/output/xlsx_foo_encoding.json'
  });

}

tests();
