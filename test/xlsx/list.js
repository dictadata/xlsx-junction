/**
 * test/xlsx/list
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/lib');
const { list } = require('@dictadata/storage-junctions/test');

logger.info("=== tests: xlsx list");

async function tests() {

  logger.info("=== list xlsx sheets");
  if (await list({
    origin: {
      smt: "xlsx|./test/data/input/foofile.xlsx|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./test/data/output/xlsx/list.json"
    }
  })) return 1;

  logger.info("=== list PA sheets");
  if (await list({
    origin: {
      "smt": "xls|/var/dictadata/PA/currentvotestats.xls|*|*",
      "options": {}
    },
    terminal: {
      output: "./test/data/output/xlsx/list_pa_votestats.json"
    }
  })) return 1;

  logger.info("=== list FL sheets");
  if (await list({
    origin: {
      "smt": "xlsx|https://dos.fl.gov/media/707693/1-by-party-by-county.xlsx|*|*",
      "options": {}
    },
    terminal: {
      output: "./test/data/output/xlsx/list_party_by_county.json"
    }
  })) return 1;

}

(async () => {
  await tests();
}) ();
