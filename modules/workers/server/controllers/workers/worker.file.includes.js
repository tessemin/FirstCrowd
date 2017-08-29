'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path');

/**
 * Extend workers's controller
 */
module.exports.file = _.extend(
  require('./worker.file/file.download.server.controller'),
  require('./worker.file/file.messages.server.controller'),
  require('./worker.file/file.read.server.controller'),
  require('./worker.file/file.submit.server.controller')
);
