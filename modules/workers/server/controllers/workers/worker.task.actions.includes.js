'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path');

/**
 * Extend workers's controller
 */
_.extend(
  module.exports,
  require('./worker.task.actions/worker.task.actions.crud.includes'),
  require('./worker.task.actions/worker.task.actions.job.includes')
);
