'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's actions controller
 */
module.exports.status = _.extend(
  require('./requester.task.actions.status/status.active.server.controller'),
  require('./requester.task.actions.status/status.suspend.server.controller')
);
