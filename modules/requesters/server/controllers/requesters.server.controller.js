'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend workers's controller
 */
module.exports = _.extend(
  require('./requesters/requesters.tasks.server.controller'),
  require('./requesters/task.tools.server.controller'),
  require('./requesters/requesters.profile.server.controller'),
  require('./requesters/task.search.server.controller')
);
