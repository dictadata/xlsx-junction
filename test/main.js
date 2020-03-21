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


async function readStream() {
  console.log("=== readStream");

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
      model:"echo",
      locus: ".",
      schema: "console",
      key: "*"
    }
  }, {
    logger: logger
  });

  console.log(">>> create streams");
  var reader = junction1.getReadStream({});
  var writer = junction2.getWriteStream({});

  console.log(">>> start pipe");
  await pipeline(reader, writer);

  await junction1.relax();
  await junction2.relax();

  console.log(">>> completed");
}


async function writeStream() {
  console.log("=== writeStream");

  console.log(">>> create junction");
  var junction1 = storage.activate({
    smt: {
      model:"json",
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
      locus: "test/output/foofile.xlsx",
      schema: "foo",
      key: "*"
    }
  }, {
    logger: logger
  });

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
  await readStream();
  await writeStream();
}

tests();
