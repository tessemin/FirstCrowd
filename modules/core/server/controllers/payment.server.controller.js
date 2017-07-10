'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend payment controller
 */
module.exports = _.extend(
  require('./payment/paypal.server.controller')
);