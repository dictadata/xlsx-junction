/**
 * test/register
 */
"use strict";

const { Storage } = require("@dictadata/storage-junctions");
const { logger } = require('@dictadata/lib');

const { XlsxJunction } = require("../storage/junctions/xlsx");

logger.info("--- adding XlsxJunction to storage cortex");
Storage.Junctions.use("xls", XlsxJunction);
Storage.Junctions.use("xlsx", XlsxJunction);
