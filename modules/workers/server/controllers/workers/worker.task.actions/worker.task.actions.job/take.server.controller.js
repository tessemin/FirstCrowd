'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'isWorker', 'addWorkerToTask', 'setStatus'];
var getUserTypeObject, isWorker, addWorkerToTask, setStatus;
[getUserTypeObject, isWorker, addWorkerToTask, setStatus] = moduleDependencies.assignDependantVariables(dependants);

// take a task
module.exports.takeTask = function (req, res) {
  // get your type object
  getUserTypeObject(req, res, function(typeObj) {
    // if you are a worker
    if (isWorker(req.user) && typeObj.worker) {
      // add yourself to the task
      // this will also bid for you
      addWorkerToTask(req.body.taskId, req, typeObj, function (err, task, typeObj) {
        if (err) {
          return res.status(422).send({
            message: err
          });
        }
        // save your type object
        typeObj.save(function(err, typeObj) {
          if (err)
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          // save the task
          task.save(function(err, task) {
            // if you need to, set task to taken
            if (task.multiplicity <= 0) {
              setStatus(req.body.taskId, 'taken', function (err, correctMsg) {
                if (err) {
                  return res.status(422).send({
                    message: err
                  });
                } else {
                  // return
                  return res.status(200).send({
                    message: 'You are now a worker for task ' + task.title
                  });
                }
              });
            } else {
              // return
              return res.status(200).send({
                message: 'You are now a worker for task ' + task.title
              });
            }
          });
        });
      });
    } else {
      return res.status(422).send({
        message: 'No worker found'
      });
    }
  });
};
