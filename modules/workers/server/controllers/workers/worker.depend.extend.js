'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's file controller
 */
 
module.exports.depend = _.extend(
  require('./worker.file/worker.file.depend'),
  require('./worker.task.actions/worker.task.actions.depend')
);
