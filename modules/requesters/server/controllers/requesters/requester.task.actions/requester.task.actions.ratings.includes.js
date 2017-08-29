'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's file controller
 */
module.exports.ratings = _.extend(
  require('./requester.task.actions.ratings/ratings.read.server.controller'),
  require('./requester.task.actions.ratings/ratings.create.server.controller')
);
