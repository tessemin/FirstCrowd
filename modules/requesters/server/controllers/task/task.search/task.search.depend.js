'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's file controller
 */
 
_.extend(
  module.exports,
  require('./task.search.client/task.search.client.depend'),
  require('./task.search.database/task.search.database.depend'),
  require('./task.search.task/task.search.task.depend')
);
