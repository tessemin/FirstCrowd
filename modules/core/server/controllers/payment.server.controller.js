'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend payment controller
 */
_.extend(
  module.exports,
  require('./payment/paypal.server.controller')
);
