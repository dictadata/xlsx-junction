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
    outputFile1: './test/data/output/xlsx/encoding_1.json',
    outputFile2: './test/data/output/xlsx/encoding_2.json'
  })) return 1;

  logger.info("=== codify foofile.xls|foo");
  if (await codify({
    origin: {
      smt: "xls|./test/data/input/foofile.xls|foo|*"
    },
    outputFile1: './test/data/output/xlsx/encoding_xls_1.json',
    outputFile2: './test/data/output/xlsx/encoding_xls_2.json'
  })) return 1;

}

(async () => {
  await tests();
})();
