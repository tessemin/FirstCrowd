'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend tasks directories file controller
 */

_.extend(
  module.exports,
  require('./task.file.directories/directories.server.controller')
);
