'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's file controller
 */
module.exports.taskCRUD = _.extend(
  require('./requester.task.actions.crud/create.server.controller'),
  require('./requester.task.actions.crud/read.server.controller'),
  require('./requester.task.actions.crud/update.server.controller'),
  require('./requester.task.actions.crud/delete.server.controller')
);
