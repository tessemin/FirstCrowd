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
  require('./requester.task.actions/requester.task.actions.bid.includes'),
  require('./requester.task.actions/requester.task.actions.crud.includes'),
  require('./requester.task.actions/requester.task.actions.ratings.includes'),
  require('./requester.task.actions/requester.task.actions.status.includes'),
  require('./requester.task.actions/requester.task.actions.submission.includes')
);
