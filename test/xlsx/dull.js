/**
 * test/xlsx/dull
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../../lib/xlsx");

const dull = require('../lib/_dull');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx");

console.log("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);


async function tests() {

  logger.info("=== xlsx dull");
  await dull({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      },
      options: {

      }
    }
  });

}

tests();
