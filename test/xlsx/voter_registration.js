/**
 * test/xlsx/voter_registration
 *
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/lib');
const { transfer } = require('@dictadata/storage-junctions/test');

logger.info("=== Test: voter_registration");

async function tests() {

  logger.info("=== all rows");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        raw: true,
        cellDates: false
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|svr_all_rows.json|*"
    }
  })) return 1;

  logger.info("=== heading");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        heading: "Active",
        cells: 9,
        column: 0
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|svr_heading.json|*",
      output: "./test/data/output/xlsx/svr_heading.json"
    }
  })) return 1;

  logger.info("=== range");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        range: "A6:R70",
        column: 0
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|svr_range.json|*",
      output: "./test/data/output/xlsx/svr_range.json"
    }
  })) return 1;

  logger.info("=== repeat");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        range: "A77:S134",
        header: "County:1"
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|svr_repeat.json|*",
      output: "./test/data/output/xlsx/svr_repeat.json"
    }
  })) return 1;

  logger.info("___ PA Table");
  if (await transfer({
    "origin": {
      "smt": "xlsx|/var/dictadata/PA/current VoterRegStatsByCongressionalDistricts.xlsx|Table|*",
      "options": {
        "range": "A1:I125",
        "column": 0
      }
    },
    "transforms": [
      {
        "transform": "filter",
        "drop": {
          "CountyName": null
        }
      }
    ],
    "terminal": {
      "smt": "csv|./test/data/output/xlsx/|stats_Table.csv|*",
      "options": {
        "header": true,
        "encoding": "./test/data/input/engrams/votereg_stats_table.engram.json"
      },
      "output": "./test/data/output/xlsx/stats_Table.csv"
    }
  })) return 1;

}

(async () => {
  await tests();
})();
