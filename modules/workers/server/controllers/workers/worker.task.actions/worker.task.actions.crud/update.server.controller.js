'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['findJobByWorker', 'getUserTypeObject', 'taskFindOne', 'updateTotalTaskProgress'];
var findJobByWorker, getUserTypeObject, taskFindOne, updateTotalTaskProgress;
[findJobByWorker, getUserTypeObject, taskFindOne, updateTotalTaskProgress] = moduleDependencies.assignDependantVariables(dependants);

var jobWhitelistedFields = ['progress'],
  taskId = null;

// update the job progress for a task
module.exports.updateProgress = function(req, res) {
  // get the user tpye object
  getUserTypeObject(req, res, function(typeObj) {
    if (typeObj.worker) {
      // find the task
      taskId = req.body.taskId;
      taskFindOne(taskId, function(err, task) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        // find the job
        var taskJob = findJobByWorker(task, typeObj);
        if (!taskJob) {
          return res.status(422).send({
            message: 'You are not a worker for this task'
          });
        }
        // amke sure you are an active worker
        if (taskJob.status !== 'active') {
          return res.status(422).send({
            message: 'You are not an active worker for this task.'
          });
        }
        // extend the progress
        taskJob = _.extend(taskJob, _.pick(req.body, jobWhitelistedFields));
        // save the job
        taskJob.save(function(err) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            // update the total progress for the task
            updateTotalTaskProgress(task, function(response) {
              if (!response)
                return res.status(422).send({
                  message: 'Error seting total progress'
                });
              else if (response.error)
                return res.status(422).send({
                  message: response.error
                });
              // return a response message
              else
                return res.status(200).send({
                  message: 'Updated successfully!'
                });
            });
          }
        });
      });
    } else {
      return res.status(400).send({
        message: 'User does not have a valid worker'
      });
    }
  });
};
