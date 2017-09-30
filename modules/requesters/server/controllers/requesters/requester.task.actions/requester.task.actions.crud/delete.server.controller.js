'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'isRequester', 'taskFindOne', 'ownsTask'];
var getUserTypeObject, isRequester, taskFindOne, ownsTask;
[getUserTypeObject, isRequester, taskFindOne, ownsTask] = moduleDependencies.assignDependantVariables(dependants);

var taskId = null;

// delete a task
module.exports.delete = function(req, res) {
  // get your typeobj
  getUserTypeObject(req, res, function(typeObj) {
    // if you are a requester
    if (isRequester(req.user)) {
      taskId = req.body.taskId;
      // find the task
      taskFindOne(taskId, function(err, task) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        if (!task)
          return res.status(422).send({
            message: 'No task found'
          });
        if (!task.requester || !task.requester.requesterId)
          return res.status(422).send({
            message: 'No owner for this task'
          });
        // make sure you own the task
        if (ownsTask(task, typeObj)) {
          // make sure there are no workers for thi task
          if (!task.jobs || task.jobs.length <= 0) {
            // remove the task
            Task.findByIdAndRemove(taskId, function (err, task) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                // TODO: repay the requester
                return res.status(200).send({
                  message: 'Task ' + task.title + ' deleted successfully',
                  taskId: task._id
                });
              }
            });
          } else {
            return res.status(422).send({
              message: 'Workers are working on that task\nPlease set status to suspended and resolve any conflicts'
            });
          }
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
