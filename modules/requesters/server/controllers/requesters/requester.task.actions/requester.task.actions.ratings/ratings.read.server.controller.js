'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['taskFindOne'];
var taskFindOne;
[taskFindOne] = moduleDependencies.assignDependantVariables(dependants);

var taskId = null;

// get the worker ratings for a task
module.exports.getWorkerRatingsForTask = function (req, res) {
  taskId = req.body.taskId;
  // finds the task
  taskFindOne(taskId, function(err, task) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    // for each worker get the rating for the requester and store them in workerRatings
    var workerRatings = {};
    if (task.jobs && task.jobs.length > 0) {
      workerRatings.requester = task.requester;
      workerRatings.ratings = [];
      for (var job = 0; job < task.jobs.length; job++) {
        if (task.jobs[job]) {
          if (task.jobs[job].workerRating) {
            // stores the ratings
            workerRatings.ratings.push({
              rating: task.jobs[job].workerRating,
              status: task.jobs[job].status,
              worker: task.jobs[job].worker
            });
          }
        }
      }
    }
    // returns the ratings
    return res.json(workerRatings);
  });
};
// gets the requester rating for a task
module.exports.getRequesterRatingsForTask = function (req, res) {
  // get the task
  taskId = req.body.taskId;
  taskFindOne(taskId, function(err, task) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    // for each job gets the rating on the reuqester for the task jobs
    var requesterRatings = {};
    if (task.jobs && task.jobs.length > 0) {
      requesterRatings.requester = task.requester;
      requesterRatings.ratings = [];
      for (var job = 0; job < task.jobs.length; job++) {
        if (task.jobs[job]) {
          if (task.jobs[job].requesterRating && task.jobs[job].progress && task.jobs[job].progress >= 100) {
            // stores the requesterRatings
            requesterRatings.ratings.push({
              rating: task.jobs[job].requesterRating,
              status: task.jobs[job].status,
              worker: task.jobs[job].worker
            });
          }
        }
      }
    }
    // return the ratings
    res.json(requesterRatings);
  });
};
