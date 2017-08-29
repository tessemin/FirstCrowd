'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  _ = require('lodash');

module.exports.getTimeInMinutes = function(milli) {
  var date = null;
  if (milli)
    date = new Date(milli);
  else
    date = new Date();
  return parseInt(((date.getTime()) / 1000 * 60), 10).toString();
};

_.extend(
  module.exports,
  require('./task.file.directories/task.file.directories.depend'),
  require('./task.file.read/task.file.read.depend'),
  require('./task.file.write/task.file.write.depend')
);
