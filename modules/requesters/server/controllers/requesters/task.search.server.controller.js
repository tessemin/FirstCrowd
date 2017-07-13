'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  _ = require('lodash');


function taskFindMany(taskArray, secretAllowed, callBack) {
  if (secretAllowed)
    Task.find({ '_id': { $in: taskArray } }, callBack);
  else
    Task.find({ '_id': { $in: taskArray }, secret: false }, callBack);
}

function taskFindOne(taskId, callBack) {
  Task.find({ '_id': taskId }, function(err, task) { if (task.length > 0) callBack(err, task[0]); else callBack(err, null); });
}

function taskFindWithOption(options, nonOptions, callBack) {
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
}

function findTaskWorker(task, worker) {
  var job = findJobByWorker(task, worker);
  if (job)
    return job.worker;
  return false;
}

function findJobByWorker(task, worker) {
  if (task && task.jobs && worker)
    for (var i = 0; i < task.jobs.length; i++) {
      if (task.jobs[i] && task.jobs[i].worker && task.jobs[i].worker.workerId)
        if (task.jobs[i].worker.workerId.toString() === worker._id.toString()) {
          return task.jobs[i];
        }
    }
  return false;
}

function findRequesterByTask(task, callBack) {
  if (task && task.requester)
    if (task.requester.requesterType.enterprise && !task.requester.requesterType.individual) {
      Enterprise.findById(task.requester.requesterId, function (err, requester) { 
        if (err) {
          callBack({ error: errorHandler.getErrorMessage(err) }) 
        }
        if (requester)
          callBack(null, requester)
        else
          callBack('no requester found');
      });
    } else if (task.requester.requesterType.individual && !task.requester.requesterType.enterprise) {
      Individual.findById(task.requester.requesterId, function (err, requester) { 
        if (err) {
          callBack({ error: errorHandler.getErrorMessage(err) }) 
        }
        if (requester)
          callBack(null, requester)
        else
          callBack('no requester found');
      });
    } else if (task.requester.requesterType.individual && task.requester.requesterType.enterprise) {
      Enterprise.findById(task.requester.requesterId, function (err, requester) { 
        if (err) {
          callBack({ error: errorHandler.getErrorMessage(err) }) 
        }
        if (requester)
          callBack(requester)
        else
          Individual.findById(task.requester.requestrerId, function (err, requester) { 
            if (err) {
              callBack(errorHandler.getErrorMessage(err)) 
            }
            if (requester)
              callBack(null, requester)
            else
              callBack('no requester found');
          });
      });
    }
  else
    callBack('Must provide a task');
}

exports.taskFindMany = taskFindMany;
exports.taskFindOne = taskFindOne;
exports.findTaskWorker = findTaskWorker;
exports.taskFindWithOption = taskFindWithOption;
exports.findTaskWorker = findTaskWorker;
exports.findJobByWorker = findJobByWorker;
exports.findRequesterByTask = findRequesterByTask;
