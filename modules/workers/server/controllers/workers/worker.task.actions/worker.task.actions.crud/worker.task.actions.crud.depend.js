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
 
module.exports.getWorkerTasks = function(req, res, taskType) {
  if (!isWorker(req.user))
    res.status(400).send({
      message: 'You are not a worker.' 
    });
  getUserTypeObject(req, res, function(typeObj) {
    taskFindMany(getIdsInArray(typeObj.worker[taskType + 'Tasks']), true, function(err, tasks) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (tasks)
        tasks = removeExtraWorkers(tasks, typeObj._id);
      return res.json({ tasks: tasks });
    });
  });
};
