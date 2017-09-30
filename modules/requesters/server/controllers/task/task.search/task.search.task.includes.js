'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters controller
 */
_.extend(
  module.exports,
  require('./task.search.task/task.server.controller')
);
