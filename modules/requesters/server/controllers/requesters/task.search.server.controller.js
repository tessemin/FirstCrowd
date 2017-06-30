'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  _ = require('lodash');
  
  
function taskFindMany(taskArray, secretAllowed, callBack) {
  if (secretAllowed)
    Task.find({ '_id': { $in: taskArray }}, callBack);
  else
    Task.find({ '_id': { $in: taskArray }, secret: false }, callBack);
}

function taskFindOne(taskId, callBack) {
  Task.find({ '_id': taskId, secret: false }, function(err, task) { if (task.length > 0) callBack(err, task[0]); else callBack(err, null); });
}

function taskFindWithOption(options, callBack) {
  Task.find(options, callBack);
}

function findTaskWorker(task, worker) {
  if (task.jobs)
    for (var i = 0; i < task.jobs.length; i++) {
      if (task.jobs[i] && task.jobs[i].worker)
        if (task.jobs[i].worker.workerId === worker._id) {
          return task.jobs[i].worker;
        }
    }
  return false;
}

exports.taskFindMany = taskFindMany;
exports.taskFindOne = taskFindOne;
exports.findTaskWorker = findTaskWorker;
exports.taskFindWithOption = taskFindWithOption;
exports.findTaskWorker = findTaskWorker;
