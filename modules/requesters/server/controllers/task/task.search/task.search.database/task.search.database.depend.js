'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task');

 // searches mongodb for the options specified and not for the options not specified
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

// finds many takes with ids
module.exports.taskFindMany = function(taskArray, secretAllowed, callBack) {
  if (!taskArray || taskArray.length <= 0)
    return callBack(null, []);
  if (secretAllowed)
    Task.find({ '_id': { $in: taskArray } }, callBack);
  else
    Task.find({ '_id': { $in: taskArray }, secret: false }, callBack);
};

// finds on task
module.exports.taskFindOne = function(taskId, callBack) {
  Task.findById(taskId, function (err, task) { callBack(err, task); });
};
