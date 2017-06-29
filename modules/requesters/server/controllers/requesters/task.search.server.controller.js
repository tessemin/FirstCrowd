'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  _ = require('lodash');
  
  
function taskFindMany(taskArray, isRequester, callBack) {
  if (isRequester)
    Task.find({ '_id': { $in: taskArray }}, callBack);
  else
    Task.find({ '_id': { $in: taskArray }, secret: false }, callBack);
}

function taskFindOne(taskId, callBack) {
  Task.find({ '_id': taskId, secret: false }, function(err, task) { callBack(err, task[0]); });
}

exports.taskFindMany = taskFindMany;
exports.taskFindOne = taskFindOne;
