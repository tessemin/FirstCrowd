'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend workers's controller
 */
module.exports = _.extend(
  require('./workers/workers.server.controller'),
  require('./workers/workers.tasks.server.controller')
);
