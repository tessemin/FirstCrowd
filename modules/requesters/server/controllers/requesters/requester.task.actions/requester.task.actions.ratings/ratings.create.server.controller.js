'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'isRequester', 'taskFindOne', 'ownsTask'];
var getUserTypeObject, isRequester, taskFindOne, ownsTask;
[getUserTypeObject, isRequester, taskFindOne, ownsTask] = moduleDependencies.assignDependantVariables(dependants);


var taskId = null;

module.exports.createRating = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    if (isRequester(req.user)) {
      taskFindOne(taskId, function(err, task) {
        if (ownsTask(task, typeObj)) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          for (var worker = 0; worker < task.jobs.length; worker++) {
            if (task.jobs[worker].workerId.toString() === req.body.worker.workerId.toString()) {
              task.jobs[worker].ratingOnWorker = req.body.rating;
              break;
            }
          }
          task.save(function(err, task) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              return res.status(200).send({
                message: 'Rating for worker succeeded'
              });
            }
          });
        } else {
          return res.status(422).send({
            message: 'You are not the owner of this task'
          });
        }
      });
    } else {
      return res.status(422).send({
        message: 'You are not a requester'
      });
    }
  });
};
