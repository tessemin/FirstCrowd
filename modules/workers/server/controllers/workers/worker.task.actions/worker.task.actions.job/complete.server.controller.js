'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpWorkerFileExchange', 'updateTotalTaskProgress'];
var setUpWorkerFileExchange, updateTotalTaskProgress;
[setUpWorkerFileExchange, updateTotalTaskProgress] = moduleDependencies.assignDependantVariables(dependants);

module.exports.markTaskCompleted = function (req, res) {
  setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
    if (task.jobs[jobIndex].status !== 'active' || !(task.status === 'open' || task.status === 'taken')) {
      return res.status(422).send({
        message: 'You are not a active worker for this task.'
      });
    }
    task.jobs[jobIndex].status = 'submitted';
    task.jobs[jobIndex].progress = 100;
    updateTotalTaskProgress(task, function(response) {
      if (!response)
        return res.status(422).send({
          message: 'Error seting total progress'
        });
      else if (response.error)
        return res.status(422).send({
          message: response.error
        });
      else
        return res.status(200).send({
          message: 'Task Marked Completed!'
        });
    });
  });
};
