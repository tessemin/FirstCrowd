'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend tasks file controller
 */
module.exports.file = _.extend(
  require('./task.file/task.file.directories.includes'),
  require('./task.file/task.file.read.includes'),
  require('./task.file/task.file.write.includes')
);
