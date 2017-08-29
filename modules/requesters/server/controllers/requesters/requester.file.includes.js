'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend requesters's file controller
 */
module.exports.file = _.extend(
  require('./requester.file/file.download.server.controller'),
  require('./requester.file/file.read.server.controller'),
  require('./requester.file/file.messages.server.controller')
);
