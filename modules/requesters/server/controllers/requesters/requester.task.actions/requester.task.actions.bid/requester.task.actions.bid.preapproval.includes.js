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
  require('./requester.task.actions.bid.preapproval/preapproval.accept.server.controller')
);
