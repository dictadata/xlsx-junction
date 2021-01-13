/**
 * test/xlsx/recall
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../../lib/xlsx");

const recall = require('../lib/_recall');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx");

console.log("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);


async function tests() {

  logger.info("=== xlsx recall");
  await recall({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      },
      options: {

      }
    }
  });

  logger.info("=== xlsx recall");
  await recall({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      },
      options: {

      }
    }
  });

}

tests();
