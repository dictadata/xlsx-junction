/**
 * test/xlsx/list
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/storage-junctions').utils;
const { list } = require('@dictadata/storage-junctions').tests;

logger.info("=== tests: xlsx list");

async function tests() {

  logger.info("=== list xlsx sheets (forEach)");
  if (await list({
    origin: {
      smt: "xlsx|./data/test/foofile.xlsx|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./data/output/xlsx/list.json"
    }
  })) return 1;

}

(async () => {
  await tests();
}) ();
