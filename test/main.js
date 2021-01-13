/**
 * test/xlsx-junction
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const XlsxJunction = require("../lib/xlsx");
const EchoJunction = require("../node_modules/@dictadata/storage-junctions/lib/echo");

const logger = require('../lib/logger');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

logger.info("=== Tests: XlsxJunction");

logger.info("--- adding XlsxJunction to storage cortex");
storage.use("xlsx", XlsxJunction);
storage.use("echo", EchoJunction);

/**
 *
 */
async function Xlsx2Csv() {
  logger.info("=== read xlsx save CSV");

  logger.info(">>> create junction");
  var junction1 = await storage.activate({
    model: "xlsx",
    locus: "test/data/foofile.xlsx",
    schema: "foo",
    key: "*"
  },
    {
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

    });

  logger.info(">>> encoding");
  let encoding = await junction1.getEncoding();
  let result_encoding = await junction2.putEncoding(encoding);
  if (!result_encoding)
    logger.warn("could not create storage schema, maybe it already exists");

  logger.info(">>> create streams");
  var reader = junction1.createReadStream({});
  var writer = junction2.createWriteStream({});

  logger.info(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  logger.info(">>> completed");
}

/**
 *
 */
async function Csv2Xlsx() {
  logger.info("=== read csv write xlsx");

  logger.info(">>> create junction");
  var junction1 = await storage.activate({
      model: "csv",
      locus: "test/data/",
      schema: "foofile.csv",
      key: "*"
    },
    {

    });

  var junction2 = await storage.activate({
    model: "xlsx",
    locus: "test/output/csv_foofile.xlsx",
    schema: "foo",
    key: "*"
  },
    {
      writer: {
        xlsx: {
          sheetName: "foo"
        }
      }
    });

  logger.info(">>> encoding");
  let encoding = await junction1.getEncoding();
  let result_encoding = await junction2.putEncoding(encoding);
  if (!result_encoding)
    logger.warn("could not create storage schema, maybe it already exists");

  logger.info(">>> create streams");
  var reader = junction1.createReadStream({});
  var writer = junction2.createWriteStream({});

  logger.info(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  logger.info(">>> completed");
}

/**
 *
 */
async function Xlsx2Json() {
  logger.info("=== read xlsx write json");

  logger.info(">>> create junction");
  var junction1 = await storage.activate({
      model: "xlsx",
      locus: "test/data/foofile.xlsx",
      schema: "foo",
      key: "*"
    },
    {
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

    });

  logger.info(">>> encoding");
  let encoding = await junction1.getEncoding();
  let result_encoding = await junction2.putEncoding(encoding);
  if (!result_encoding)
    logger.warn("could not create storage schema, maybe it already exists");

  logger.info(">>> create streams");
  var reader = junction1.createReadStream({});
  var writer = junction2.createWriteStream({});

  logger.info(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  logger.info(">>> completed");
}

/**
 *
 */
async function Json2Xlsx() {
  logger.info("=== read json write xlsx");

  logger.info(">>> create junction");
  var junction1 = await storage.activate({
      model: "json",
      locus: "test/data/",
      schema: "foofile.json",
      key: "*"
    },
    {

    });

  var junction2 = await storage.activate({
      model: "xlsx",
      locus: "test/output/json_foofile.xlsx",
      schema: "foo",
      key: "*"
    },
    {
      writer: {
        xlsx: {
          sheetName: "foo",
          sheet: {
            origin: 'B3'
          }
        }
      }
    });

  logger.info(">>> encoding");
  let encoding = await junction1.getEncoding();
  let result_encoding = await junction2.putEncoding(encoding);
  if (!result_encoding)
    logger.warn("could not create storage schema, maybe it already exists");

  logger.info(">>> create streams");
  var reader = junction1.createReadStream({});
  var writer = junction2.createWriteStream({});

  logger.info(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  logger.info(">>> completed");
}


async function tests() {
  await Xlsx2Csv();
  await Csv2Xlsx();
  await Xlsx2Json();
  await Json2Xlsx();
}

tests();
