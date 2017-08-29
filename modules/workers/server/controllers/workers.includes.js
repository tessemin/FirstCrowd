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
  require('./workers/worker.task.actions.includes'),
  require('./workers/worker.file.includes'),
  require('./workers/worker.depend.extend')
);
