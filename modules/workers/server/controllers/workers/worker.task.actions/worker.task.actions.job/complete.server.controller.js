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

// mark a task completed
module.exports.markTaskCompleted = function (req, res) {
  // set up the file exchange
  setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
    // you must be active on the job and the task must be in a working state
    if (task.jobs[jobIndex].status !== 'active' || !(task.status === 'open' || task.status === 'taken')) {
      return res.status(422).send({
        message: 'You are not a active worker for this task.'
      });
    }
    // set your status to submitted
    task.jobs[jobIndex].status = 'submitted';
    // set progress
    task.jobs[jobIndex].progress = 100;
    // update the total progress
    updateTotalTaskProgress(task, function(response) {
      if (!response)
        return res.status(422).send({
          message: 'Error seting total progress'
        });
      else if (response.error)
        return res.status(422).send({
          message: response.error
        });
      else // send a response message
        return res.status(200).send({
          message: 'Task Marked Completed!'
        });
    });
  });
};
