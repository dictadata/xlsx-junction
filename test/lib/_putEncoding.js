/**
 * test/putEncoding
 */
"use strict";

const storage = require('@dictadata/storage-junctions');
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (options) {

  logger.info(">>> create junction");
  var junction = await storage.activate(options.source.smt, options.source.options);

  try {
    let encoding = JSON.parse(fs.readFileSync("./test/data/foo_encoding.json", "utf8"));

    let newencoding = await junction.putEncoding(encoding);
    if (typeof newencoding === 'object')
      logger.verbose(JSON.stringify(newencoding));
    else
      logger.warn("could not create storage schema: " + newencoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
