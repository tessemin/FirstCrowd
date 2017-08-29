'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path');

/**
 * Extend workers's controller
 */
module.exports.job = _.extend(
  require('./worker.task.actions.job/complete.server.controller'),
  require('./worker.task.actions.job/quit.server.controller'),
  require('./worker.task.actions.job/take.server.controller')
);
