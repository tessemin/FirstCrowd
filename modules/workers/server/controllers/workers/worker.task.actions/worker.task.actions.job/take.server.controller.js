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

module.exports.takeTask = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    if (isWorker(req.user) && typeObj.worker) {
      addWorkerToTask(req.body.taskId, req, typeObj, function (err, task, typeObj) {
        if (err) {
          return res.status(422).send({
            message: err
          });
        }
        typeObj.save(function(err, typeObj) {
          if (err)
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          task.save(function(err, task) {
            if (task.multiplicity <= 0) {
              setStatus(req.body.taskId, 'taken', function (err, correctMsg) {
                if (err) {
                  return res.status(422).send({
                    message: err
                  });
                } else {
                  return res.status(200).send({
                    message: 'You are now a worker for task ' + task.title
                  });
                }
              });
            } else {
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
