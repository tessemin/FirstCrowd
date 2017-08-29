'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend workers's controller
 */
_.extend(
  module.exports,
  require('./requesters/requester.file.includes'),
  require('./requesters/requester.task.actions.includes'),
  require('./requesters/requester.depend.extend')
);
