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

  logger.info("=== FL CD");
  if (await transfer({
    "origin": {
      "smt": "xlsx|https://dos.fl.gov/media/707700/5-party-by-congressional-district.xlsx|RegistrationByPartyDistUSR|*",
        "options": {
          "range": "A10:S110",
          "trim": true,
          "encoding": "./test/data/input/engrams/party_by_district.engram.json"
        }
    },
    "terminal": {
      "smt": "csv|./test/data/output/xlsx/|vreg_fl_cd.csv|*",
      "options": {
        "header": true
      },
      "output": "./test/data/output/xlsx/vreg_fl_cd.csv"
    }
  })) return 1;

  logger.info("=== PA Table");
  if (await transfer({
    "origin": {
      "smt": "xlsx|/var/dictadata/PA/current VoterRegStatsByCongressionalDistricts.xlsx|Table|*",
      "options": {
        "range": "A2:I125",
        "column": 0,
        "encoding": "./test/data/input/engrams/votereg_stats_table.engram.json"
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
      "smt": "csv|./test/data/output/xlsx/|vreg_pa_stats.csv|*",
      "options": {
        "header": true
      },
      "output": "./test/data/output/xlsx/vreg_pa_stats.csv"
    }
  })) return 1;

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
      smt: "json|./test/data/output/xlsx/|vreg_raw.json|*",
      output: "./test/data/output/xlsx/vreg_raw.json"
    }
  })) return 1;

  logger.info("=== heading");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        heading: "Active",
        cells: 9,
        column: 0,
        missingValue: "*"
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|vreg_heading.json|*",
      output: "./test/data/output/xlsx/vreg_heading.json"
    }
  })) return 1;

  logger.info("=== range");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        range: "A6:R70",
        column: 0,
        missingCells: false,
        missingValue: "*"
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|vreg_range.json|*",
      output: "./test/data/output/xlsx/vreg_range.json"
    }
  })) return 1;

  logger.info("=== repeat");
  if (await transfer({
    origin: {
      smt: "xlsx|./test/data/input/State_Voter_Registration_2024_PPE.xlsx|in|*",
      options: {
        range: "A77:S134",
        header: "County:1",
        missingCells: false,
        missingValue: "*"
      }
    },
    terminal: {
      smt: "json|./test/data/output/xlsx/|vreg_repeat.json|*",
      output: "./test/data/output/xlsx/vreg_repeat.json"
    }
  })) return 1;

}

(async () => {
  await tests();
})();
