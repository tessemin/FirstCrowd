'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'isRequester', 'getIdsInArray', 'taskFindMany', 'mapTaskJobToDisplay'];
var getUserTypeObject, isRequester, getIdsInArray, taskFindMany, mapTaskJobToDisplay;
[getUserTypeObject, isRequester, getIdsInArray, taskFindMany, mapTaskJobToDisplay] = moduleDependencies.assignDependantVariables(dependants);

module.exports.updateTotalTaskProgress = function(task, callBack) {
  if (task && task.jobs) {
    var agregateProgress = 0;
    var workers = 0;
    for (var job = 0; job < task.jobs.length; job++) {
      if (task.jobs[job] && task.jobs[job].worker && task.jobs[job].worker.workerId && (task.jobs[job].status !== 'quit')) {
        workers++;
        agregateProgress += task.jobs[job].progress;
      }
    }
    if (workers > 0 && agregateProgress > 0)
      task.totalProgress = agregateProgress / workers;
    else
      task.totalProgress = 0;
    task.save(function(err, task) {
      if (err)
        callBack({ error: errorHandler.getErrorMessage(err) });
      else
        callBack(task.totalProgress);
    });
  } else {
    callBack(false);
  }
};

var getAllRequesterTaskIds = function(typeObj) {
  return [].concat(getIdsInArray(typeObj.requester.activeTasks),
    getIdsInArray(typeObj.requester.rejectedTasks),
    getIdsInArray(typeObj.requester.completedTasks),
    getIdsInArray(typeObj.requester.suspendedTasks));
};
module.exports.getAllRequesterTaskIds = getAllRequesterTaskIds;

module.exports.getAllRequesterTasks = function(req, res, callBack) {
  getUserTypeObject(req, res, function(typeObj) {
    if (!(isRequester(req.user) && typeObj.requester)) {
      return res.status(422).send({
        message: 'You are not a requester'
      });
    }
    taskFindMany(getAllRequesterTaskIds(typeObj), true, function(err, tasks) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        tasks = mapTaskJobToDisplay(tasks);
        if (callBack) {
          return callBack(tasks);
        }
        return res.json({ tasks: tasks });
      }
    });
  });
};

module.exports.getRequesterTasks = function(req, res, taskType, callBack) {
  getUserTypeObject(req, res, function(typeObj) {
    if (isRequester(req.user)) {
      if (typeObj.requester) {
        var ids;
        if (taskType)
          ids = getIdsInArray(typeObj.requester[taskType + 'Tasks']);
        else
          ids = getAllRequesterTaskIds(typeObj);
        taskFindMany(ids, true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            tasks = mapTaskJobToDisplay(tasks);
            if (callBack) {
              return callBack(tasks);
            }
            return res.json({ tasks: tasks });
          }
        });
      } else {
        return res.status(422).send({
          message: 'No requester found'
        });
      }
    } else {
      return res.status(422).send({
        message: 'You are not a requester'
      });
    }
  });
};
