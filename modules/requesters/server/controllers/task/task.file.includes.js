'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend workers's controller
 */
module.exports.file = _.extend(
  require('./task.file/task.file.directories.includes'),
  require('./task.file/task.file.read.includes'),
  require('./task.file/task.file.write.includes')
);
