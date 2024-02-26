/**
 * test/codify
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/storage-junctions/utils');
const { codify } = require('@dictadata/storage-junctions/test');

logger.info("=== tests: xlsx Codify");

async function tests() {

  logger.info("=== codify foofile.xlsx|foo");
  if (await codify({
    origin: {
      smt: "xlsx|./test/data/input/foofile.xlsx|foo|*"
    },
    output: './test/data/output/xlsx/codify_xlsx.json'
  })) return 1;

  logger.info("=== codify foofile.xls|foo");
  if (await codify({
    origin: {
      smt: "xls|./test/data/input/foofile.xls|foo|*"
    },
    output: './test/data/output/xlsx/codify_xls.json'
  })) return 1;

}

(async () => {
  await tests();
})();
