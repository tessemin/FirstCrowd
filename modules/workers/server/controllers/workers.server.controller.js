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
  require('./workers/workers.status.server.controller'),
  require('./workers/workers.file.server.controller')
);
