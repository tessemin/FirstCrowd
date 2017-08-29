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
  require('./requester.task.actions.bid.bidable/bidable.accept.server.controller')
);
