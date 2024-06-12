/**
 * test/xlsx/list
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/lib');
const { list } = require('@dictadata/storage-junctions/test');

logger.info("=== tests: xlsx list");

async function tests() {

  logger.info("=== list xlsx sheets (forEach)");
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

}

(async () => {
  await tests();
}) ();
