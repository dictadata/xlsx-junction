/**
 * test/xlsx/encoding
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../../lib/xlsx");

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx");

console.log("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);


async function tests() {

  logger.info("=== xlsx putEncoding");
  await putEncoding({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|*",
      options: {

      }
    }
  });

  logger.info("=== xlsx getEncoding");
  await getEncoding({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|*",
      options: {

      }
    },
    OutputFile: './test/output/xlsx_foo_encoding.json'
  });

}

tests();
