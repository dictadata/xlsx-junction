/**
 * test/xlsx/recall
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../../lib/xlsx");

const recall = require('../lib/_recall');
const logger = require('../logger');

logger.info("=== Test: xlsx");

console.log("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);


async function tests() {

  logger.info("=== xlsx recall");
  await recall({
    source: {
      smt: "xlsx|DSN=drewlab|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      },
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== xlsx recall");
  await recall({
    source: {
      smt: "xlsx|DSN=drewlab|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      },
      options: {
        logger: logger
      }
    }
  });

}

tests();
