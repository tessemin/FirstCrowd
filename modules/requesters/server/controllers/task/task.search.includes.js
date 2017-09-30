'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend tasks search controller
 */
module.exports.search = _.extend(
  require('./task.search/task.search.client.includes'),
  require('./task.search/task.search.database.includes'),
  require('./task.search/task.search.task.includes')
);
