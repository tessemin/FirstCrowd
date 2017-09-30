'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path');

/**
 * Extend workers's crud controller
 */
module.exports.crud = _.extend(
  require('./worker.task.actions.crud/read.server.controller'),
  require('./worker.task.actions.crud/update.server.controller')
);
