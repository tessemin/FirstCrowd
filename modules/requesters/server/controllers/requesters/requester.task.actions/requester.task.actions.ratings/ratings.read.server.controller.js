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

module.exports.getWorkerRatingsForTask = function (req, res) {
  taskId = req.body.taskId;
  taskFindOne(taskId, function(err, task) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    var workerRatings = {};
    if (task.jobs && task.jobs.length > 0) {
      workerRatings.requester = task.requester;
      workerRatings.ratings = [];
      for (var job = 0; job < task.jobs.length; job++) {
        if (task.jobs[job]) {
          if (task.jobs[job].workerRating) {
            workerRatings.ratings.push({
              rating: task.jobs[job].workerRating,
              status: task.jobs[job].status,
              worker: task.jobs[job].worker
            });
          }
        }
      }
    }
    return res.json(workerRatings);
  });
};
module.exports.getRequesterRatingsForTask = function (req, res) {
  taskId = req.body.taskId;
  taskFindOne(taskId, function(err, task) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    var requesterRatings = {};
    if (task.jobs && task.jobs.length > 0) {
      requesterRatings.requester = task.requester;
      requesterRatings.ratings = [];
      for (var job = 0; job < task.jobs.length; job++) {
        if (task.jobs[job]) {
          if (task.jobs[job].requesterRating && task.jobs[job].progress && task.jobs[job].progress >= 100) {
            requesterRatings.ratings.push({
              rating: task.jobs[job].requesterRating,
              status: task.jobs[job].status,
              worker: task.jobs[job].worker
            });
          }
        }
      }
    }
    res.json(requesterRatings);
  });
};
