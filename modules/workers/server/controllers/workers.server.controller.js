'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path');

/**
 * Extend workers's controller
 */
module.exports = _.extend(
  require('./workers/workers.tasks.server.controller'),
  require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller'))
);
