'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getWorkerTasks', 'getUserTypeObject', 'taskFindOne', 'findTaskWorker'];
var getWorkerTasks, getUserTypeObject, taskFindOne, findTaskWorker;
[getWorkerTasks, getUserTypeObject, taskFindOne, findTaskWorker] = moduleDependencies.assignDependantVariables(dependants);

var taskId = null;
// get your active tasks
module.exports.getActiveTasks = function (req, res) {
  getWorkerTasks(req, res, 'active');
};
// get your rejected tasks
module.exports.getRejectedTasks = function (req, res) {
  getWorkerTasks(req, res, 'rejected');
};
// get your completed tasks
module.exports.getCompletedTasks = function (req, res) {
  getWorkerTasks(req, res, 'completed');
};
// get your inactive tasks
module.exports.getInactiveTasks = function (req, res) {
  getWorkerTasks(req, res, 'inactive');
};
// get your recomended tasks
module.exports.getRecomendedTasks = function (req, res) {
  getWorkerTasks(req, res, 'recomended');
};
// get your worker object for a task
module.exports.getWorkerForTask = function(req, res) {
  taskId = req.body.taskId;
  // get your typ object
  getUserTypeObject(req, res, function(typeObj) {
    // find the task
    taskFindOne(taskId, function(err, task) {
      // find the worker object in the task
      var isWorker = findTaskWorker(task, typeObj, res);
      // if you are a worker return the worker
      if (isWorker)
        return res.json({ worker: isWorker });
      else // else return an error
        return res.status(422).send({
          message: 'You are not a worker for this task'
        });
    });
  });
};
