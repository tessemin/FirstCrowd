'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task');
 
module.exports.taskFindWithOption = function(options, nonOptions, callBack) {
  var requestOptions = [];
  if (Array.isArray(options))
    requestOptions = requestOptions.concat(options);
  else
    requestOptions.push(options);
  if (Array.isArray(nonOptions))
    requestOptions = requestOptions.concat(nonOptions);
  else
    requestOptions.push(nonOptions);

  Task.find({ $and: requestOptions }, callBack);
};

module.exports.taskFindMany = function(taskArray, secretAllowed, callBack) {
  if (!taskArray || taskArray.length <= 0)
    return callBack(null, []);
  if (secretAllowed)
    Task.find({ '_id': { $in: taskArray } }, callBack);
  else
    Task.find({ '_id': { $in: taskArray }, secret: false }, callBack);
};

module.exports.taskFindOne = function(taskId, callBack) {
  Task.findById(taskId, function (err, task) { callBack(err, task); });
};
