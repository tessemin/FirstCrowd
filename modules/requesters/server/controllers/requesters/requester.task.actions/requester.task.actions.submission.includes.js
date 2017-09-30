'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's actions controller
 */
module.exports.submission = _.extend(
  require('./requester.task.actions.submission/approve.server.controller'),
  require('./requester.task.actions.submission/reject.server.controller'),
  require('./requester.task.actions.submission/retry.server.controller')
);
