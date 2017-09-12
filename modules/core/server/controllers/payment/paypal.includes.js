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
  require('./paypal/paypal.payIn.includes'),
  require('./paypal/paypal.payOut.includes')
);
