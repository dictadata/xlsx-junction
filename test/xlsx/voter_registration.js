/**
 * test/xlsx/voter_registration
 *
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/storage-junctions/utils');
const { transfer } = require('@dictadata/storage-junctions/test');

logger.info("=== Test: voter_registration");

async function tests() {

  logger.info("=== all rows");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        raw: true
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|svr_all_rows.json|*",
      options: {}
    }
  })) return 1;

  logger.info("=== county");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        range: "A6:R74"
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|svr_range.json|*",
      options: {}
    }
  })) return 1;

}

(async () => {
  await tests();
})();
