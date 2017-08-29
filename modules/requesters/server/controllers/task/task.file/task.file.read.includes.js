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
  require('./task.file.read/read.server.controller')
);
