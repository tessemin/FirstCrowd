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
  require('./paypal.payIn/payIn.create.js'),
  require('./paypal.payIn/payIn.execute.js')
);
