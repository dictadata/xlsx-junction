/**
 * test/xlsx-junction
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../lib/xlsx");
const EchoJunction = require("../node_modules/@dictadata/storage-junctions/lib/echo");

const logger = require('./logger');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

console.log("=== Tests: XlsxJunction");

console.log("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);
storage.use("echo", EchoJunction);

/**
 *
 */
async function Xlsx2Csv() {
  console.log("=== read xlsx save CSV");

  console.log(">>> create junction");
  var junction1 = await storage.activate({
    model: "xlsx",
    locus: "test/data/foofile.xlsx",
    schema: "foo",
    key: "*"
  },
    {
      logger: logger,
      reader: {
        xlsx: {
          sheetName: "foo"
        }
      }
    });

  // doesn't really matter what is used for the echo SMT
  var junction2 = await storage.activate({
      model: "csv",
      locus: "./test/output/",
      schema: "xlsx_foofile.csv",
      key: "*"
    },
    {
      logger: logger
    });

  console.log(">>> encoding");
  let encoding = await junction1.getEncoding();
  let result_encoding = await junction2.putEncoding(encoding);
  if (!result_encoding)
    logger.warn("could not create storage schema, maybe it already exists");

  console.log(">>> create streams");
  var reader = junction1.getReadStream({});
  var writer = junction2.getWriteStream({});

  console.log(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  console.log(">>> completed");
}

/**
 *
 */
async function Csv2Xlsx() {
  console.log("=== read csv write xlsx");

  console.log(">>> create junction");
  var junction1 = await storage.activate({
      model: "csv",
      locus: "test/data/",
      schema: "foofile.csv",
      key: "*"
    },
    {
      logger: logger
    });

  var junction2 = await storage.activate({
    model: "xlsx",
    locus: "test/output/csv_foofile.xlsx",
    schema: "foo",
    key: "*"
  },
    {
      logger: logger,
      writer: {
        xlsx: {
          sheetName: "foo"
        }
      }
    });

  console.log(">>> encoding");
  let encoding = await junction1.getEncoding();
  let result_encoding = await junction2.putEncoding(encoding);
  if (!result_encoding)
    logger.warn("could not create storage schema, maybe it already exists");

  console.log(">>> create streams");
  var reader = junction1.getReadStream({});
  var writer = junction2.getWriteStream({});

  console.log(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  console.log(">>> completed");
}

/**
 *
 */
async function Xlsx2Json() {
  console.log("=== read xlsx write json");

  console.log(">>> create junction");
  var junction1 = await storage.activate({
      model: "xlsx",
      locus: "test/data/foofile.xlsx",
      schema: "foo",
      key: "*"
    },
    {
      logger: logger,
      reader: {
        xlsx: {
          sheetName: "foo"
        }
      }
    });

  // doesn't really matter what is used for the echo SMT
  var junction2 = await storage.activate({
      model: "json",
      locus: "./test/output/",
      schema: "xlsx_foofile.json",
      key: "*"
    },
    {
      logger: logger
    });

  console.log(">>> encoding");
  let encoding = await junction1.getEncoding();
  let result_encoding = await junction2.putEncoding(encoding);
  if (!result_encoding)
    logger.warn("could not create storage schema, maybe it already exists");

  console.log(">>> create streams");
  var reader = junction1.getReadStream({});
  var writer = junction2.getWriteStream({});

  console.log(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  console.log(">>> completed");
}

/**
 *
 */
async function Json2Xlsx() {
  console.log("=== read json write xlsx");

  console.log(">>> create junction");
  var junction1 = await storage.activate({
      model: "json",
      locus: "test/data/",
      schema: "foofile.json",
      key: "*"
    },
    {
      logger: logger
    });

  var junction2 = await storage.activate({
      model: "xlsx",
      locus: "test/output/json_foofile.xlsx",
      schema: "foo",
      key: "*"
    },
    {
      logger: logger,
      writer: {
        xlsx: {
          sheetName: "foo",
          sheet: {
            origin: 'B3'
          }
        }
      }
    });

  console.log(">>> encoding");
  let encoding = await junction1.getEncoding();
  let result_encoding = await junction2.putEncoding(encoding);
  if (!result_encoding)
    logger.warn("could not create storage schema, maybe it already exists");

  console.log(">>> create streams");
  var reader = junction1.getReadStream({});
  var writer = junction2.getWriteStream({});

  console.log(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  console.log(">>> completed");
}


async function tests() {
  await Xlsx2Csv();
  await Csv2Xlsx();
  await Xlsx2Json();
  await Json2Xlsx();
}

tests();
