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

module.exports.getActiveTasks = function (req, res) {
  getWorkerTasks(req, res, 'active');
};

module.exports.getRejectedTasks = function (req, res) {
  getWorkerTasks(req, res, 'rejected');
};

module.exports.getCompletedTasks = function (req, res) {
  getWorkerTasks(req, res, 'completed');
};

module.exports.getInactiveTasks = function (req, res) {
  getWorkerTasks(req, res, 'inactive');
};

module.exports.getRecomendedTasks = function (req, res) {
  getWorkerTasks(req, res, 'recomended');
};

module.exports.getWorkerForTask = function(req, res) {
  taskId = req.body.taskId;
  getUserTypeObject(req, res, function(typeObj) {
    taskFindOne(taskId, function(err, task) {
      var isWorker = findTaskWorker(task, typeObj, res);
      if (isWorker)
        return res.json({ worker: isWorker });
      else
        return res.status(422).send({
          message: 'You are not a worker for this task'
        });
    });
  });
};
