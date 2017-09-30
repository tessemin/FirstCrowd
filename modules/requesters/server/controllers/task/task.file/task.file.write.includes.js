'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend tasks write file controller
 */

_.extend(
  module.exports,
  require('./task.file.write/write.server.controller')
);
