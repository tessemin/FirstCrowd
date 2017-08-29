'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend workers's controller
 */
_.extend(
  module.exports,
  require('./task.search.task/task.server.controller')
);
