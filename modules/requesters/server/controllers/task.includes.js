'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend task controller
 */
_.extend(
  module.exports,
  require('./task/task.file.includes'),
  require('./task/task.actions.includes'),
  require('./task/task.search.includes'),
  require('./task/task.depend.extend')
);
