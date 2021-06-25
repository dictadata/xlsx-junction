/**
 * test/json
 */
"use strict";

require("../register");
const { logger } = require('@dictadata/storage-junctions/utils');
const { transfer, dullSchema } = require('@dictadata/storage-junctions/test');

logger.info("=== Test: xlsx transforms");

async function tests() {

  logger.verbose('=== xlsx > xlsx_transform_1.json');
  if (await transfer({
    origin: {
      smt: "xlsx|./data/test/foofile.xlsx|foo|*",
      options: {
        match: {
          "Bar": { "wc": "row*" }
        },
        fields: ["Foo", "Bar", "Baz", "Dt Test"]
      }
    },
    terminal: {
      smt: "json|./data/output/xlsx/|transform_1.json|*"
    }
  })) return 1;

  logger.verbose('=== xlsx > xlsx_transform_2.json');
  if (await transfer({
    origin: {
      smt: "xlsx|./data/test/foofile.xlsx|foo|*"
    },
    transforms: {
      "filter": {
        "match": {
          "Bar": "row"
        },
        "drop": {
          "Baz": { "gt": 500 }
        }
      },
      "select": {
        "inject_before": {
          "fie": "where's fum?"
        },
        "inject_after": {
          "fum": "here"
        },
        "fields": {
          "Dt Test": "dt_date",
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe"
        },
        "remove": ["fobe"],
      }
    },
    terminal: {
      smt: "json|./data/output/xlsx/|transform_2.json|*"
    }
  })) return 1;

}

(async () => {
  await tests();
})();
