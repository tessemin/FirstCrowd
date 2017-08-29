'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindWithOption', 'removeExtraWorkers'];
var getUserTypeObject, taskFindWithOption, removeExtraWorkers;
[getUserTypeObject, taskFindWithOption, removeExtraWorkers] = moduleDependencies.assignDependantVariables(dependants);

module.exports.getAllOpenTasks = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    taskFindWithOption({ status: 'open', secret: false },
      [{ 'jobs': { $not: { $elemMatch: { 'worker.workerId': typeObj._id } } } },
      { 'requester.requesterId': { $ne: typeObj._id } }],
      function (err, tasks) {
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

module.exports.getTasksWithOptions = function(req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    req.body.secret = false;
    taskFindWithOption(req.body,
      [{ 'jobs': { $not: { $elemMatch: { 'worker.workerId': typeObj._id } } } },
      { 'requester.requesterId': { $ne: typeObj._id } }],
      function (err, tasks) {
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
