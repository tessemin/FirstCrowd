'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's actions bid controller
 */
_.extend(
  module.exports,
  require('./requester.task.actions.bid.bidable/bidable.accept.server.controller')
);
