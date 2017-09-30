'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['isWorker', 'getUserTypeObject', 'taskFindMany', 'getIdsInArray', 'removeExtraWorkers'];
var isWorker, getUserTypeObject, taskFindMany, getIdsInArray, removeExtraWorkers;
[isWorker, getUserTypeObject, taskFindMany, getIdsInArray, removeExtraWorkers] = moduleDependencies.assignDependantVariables(dependants);

// get the worker tasks for a specific taskType
module.exports.getWorkerTasks = function(req, res, taskType) {
  // make sure you are a worker
  if (!isWorker(req.user))
    res.status(400).send({
      message: 'You are not a worker.'
    });
  // get the type object
  getUserTypeObject(req, res, function(typeObj) {
    // find the tasks
    taskFindMany(getIdsInArray(typeObj.worker[taskType + 'Tasks']), true, function(err, tasks) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      // remove extra workers from the task
      if (tasks)
        tasks = removeExtraWorkers(tasks, typeObj._id);
      // send the tasks
      return res.json({ tasks: tasks });
    });
  });
};
