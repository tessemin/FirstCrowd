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

// update the total task progress
module.exports.updateTotalTaskProgress = function(task, callBack) {
  if (task && task.jobs) {
    // calculate the total progress
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
    // save the task
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
// get all the requester tasks ids
var getAllRequesterTaskIds = function(typeObj) {
  return [].concat(getIdsInArray(typeObj.requester.activeTasks),
    getIdsInArray(typeObj.requester.rejectedTasks),
    getIdsInArray(typeObj.requester.completedTasks),
    getIdsInArray(typeObj.requester.suspendedTasks));
};
module.exports.getAllRequesterTaskIds = getAllRequesterTaskIds;

// get all reuqester tasks
module.exports.getAllRequesterTasks = function(req, res, callBack) {
  // get the type object
  getUserTypeObject(req, res, function(typeObj) {
    if (!(isRequester(req.user) && typeObj.requester)) {
      return res.status(422).send({
        message: 'You are not a requester'
      });
    }
    // find all the tasks based on the ids you get from getAllRequesterTaskIds(typeObj)
    taskFindMany(getAllRequesterTaskIds(typeObj), true, function(err, tasks) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        // map to display a job
        tasks = mapTaskJobToDisplay(tasks);
        if (callBack) {
          return callBack(tasks);
        }
        // return tha tasks
        return res.json({ tasks: tasks });
      }
    });
  });
};

// get a requester tasks for a sepecific task array
module.exports.getRequesterTasks = function(req, res, taskType, callBack) {
  // get the type object
  getUserTypeObject(req, res, function(typeObj) {
    if (isRequester(req.user)) {
      if (typeObj.requester) {
        var ids;
        // if task type is specified
        if (taskType)
          ids = getIdsInArray(typeObj.requester[taskType + 'Tasks']);
        else
          ids = getAllRequesterTaskIds(typeObj);
        // find all the tasks
        taskFindMany(ids, true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            // map tasks to display
            tasks = mapTaskJobToDisplay(tasks);
            if (callBack) {
              return callBack(tasks);
            }
            // return the tasks
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
