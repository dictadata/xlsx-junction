/**
 * test/codify
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/lib');
const { codify } = require('@dictadata/storage-junctions/test');

logger.info("=== tests: xlsx Codify");

async function tests() {

  logger.info("=== codify foofile.xlsx|foo");
  if (await codify({
    origin: {
      smt: "xlsx|./test/data/input/foofile.xlsx|foo|*",
      options: {
        missingCells: true
      }
    },
    terminal: {
      output: './test/data/output/xlsx/codify_xlsx.json'
    }
  })) return 1;

  logger.info("=== codify foofile.xls|foo");
  if (await codify({
    origin: {
      smt: "xls|./test/data/input/foofile.xls|foo|*",
      options: {
        cellDates: true,
        missingCells: true
      }
    },
    terminal: {
      output: './test/data/output/xlsx/codify_xls.json'
    }
  })) return 1;

  logger.info("=== codify voter registration");
  if (await codify({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        cellDates: false,
        heading: "Active",
        cells: 9,
        column: 0
      }
    },
    terminal: {
      output: './test/data/output/xlsx/codify_svr.json'
    }
  })) return 1;

}

(async () => {
  await tests();
})();
