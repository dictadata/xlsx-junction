/**
 * test/transportdb-junction
 */
"use strict";

const storage = require("@dictadata/storage-junctions");
const logger = storage.utils.logger;

const XlsxJunction = require("../storage/junctions/xlsx");

logger.info("--- adding TransportDBJunction to storage cortex");
storage.use("xls", XlsxJunction);
storage.use("xlsx", XlsxJunction);
