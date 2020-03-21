/**
 * test/xlsx/store
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../../lib/xlsx");

const store = require('../lib/_store');
const logger = require('../logger');

logger.info("=== Test: xlsx");

console.log("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);


async function tests() {

  logger.info("=== xlsx store 20");
  await store({
    source: {
      smt: "xlsx|DSN=drewlab|foo_schema|=Foo",
      options: {
        logger: logger
      }
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== xlsx store 30");
  await store({
    source: {
      smt: "xlsx|DSN=drewlab|foo_schema|=Foo",
      options: {
        logger: logger
      }
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 30,
      enabled: false
    }
  });

  logger.info("=== xlsx store 10");
  await store({
    source: {
      smt: "xlsx|DSN=drewlab|foo_schema|=Foo",
      options: {
        logger: logger
      }
    },
    construct: {
      Foo: 'ten',
      Bar: 'Hamilton',
      Baz: 10,
      enabled: false
    }
  });

}

tests();
