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


async function readCsv() {
  console.log("=== readCsv");

  console.log(">>> create junction");
  var junction1 = storage.activate({
    smt: {
      model:"xlsx",
      locus: "test/data/foofile.xlsx",
      schema: "foo",
      key: "*"
    }
  },
  {
    sheetName: "foo",
    logger: logger
  });

  // doesn't really matter what is used for the echo SMT
  var junction2 = storage.activate({
    smt: {
      model:"csv",
      locus: "./test/output/",
      schema: "foofile_xlsx.csv",
      key: "*"
    }
  }, {
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


async function writeCsv() {
  console.log("=== writeCsv");

  console.log(">>> create junction");
  var junction1 = storage.activate({
    smt: {
      model: "csv",
      locus: "test/data/",
      schema: "foofile.csv",
      key: "*"
    }
  },
  {
    logger: logger
  });

  var junction2 = storage.activate({
    smt: {
      model:"xlsx",
      locus: "test/output/foofile_csv.xlsx",
      schema: "foo",
      key: "*"
    }
  }, {
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

async function readJson() {
  console.log("=== readJson");

  console.log(">>> create junction");
  var junction1 = storage.activate({
    smt: {
      model:"xlsx",
      locus: "test/data/foofile.xlsx",
      schema: "foo",
      key: "*"
    }
  },
  {
    sheetName: "foo",
    logger: logger
  });

  // doesn't really matter what is used for the echo SMT
  var junction2 = storage.activate({
    smt: {
      model:"json",
      locus: "./test/output/",
      schema: "foofile_xlsx.json",
      key: "*"
    }
  }, {
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


async function writeJson() {
  console.log("=== writeJson");

  console.log(">>> create junction");
  var junction1 = storage.activate({
    smt: {
      model: "json",
      locus: "test/data/",
      schema: "foofile.json",
      key: "*"
    }
  },
  {
    logger: logger
  });

  var junction2 = storage.activate({
    smt: {
      model:"xlsx",
      locus: "test/output/foofile_json.xlsx",
      schema: "foo",
      key: "*"
    }
  }, {
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


async function tests() {
  await readCsv();
  await writeCsv();
  await readJson();
  await writeJson();
}

tests();
