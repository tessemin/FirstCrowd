'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's file controller
 */
module.exports.bidding = _.extend(
  require('./requester.task.actions.bid/bid.reject.server.controller'),
  require('./requester.task.actions.bid/requester.task.actions.bid.preapproval.includes'),
  require('./requester.task.actions.bid/requester.task.actions.bid.bidable.includes')
);
