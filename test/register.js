/**
 * test/transportdb-junction
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const { logger } = require("@dictadata/storage-junctions").utils;

const XlsxJunction = require("../storage/junctions/xlsx");

logger.info("--- adding TransportDBJunction to storage cortex");
storage.use("xls", XlsxJunction);
storage.use("xlsx", XlsxJunction);
