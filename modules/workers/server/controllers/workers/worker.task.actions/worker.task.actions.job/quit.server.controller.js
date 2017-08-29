'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindOne', 'findJobByWorker', 'removeTaskFromWorkerArray', 'addWorkerTaskWithStatus', 'updateTotalTaskProgress', 'sendWorkerMessage', 'hashObjId'];
var getUserTypeObject, taskFindOne, findJobByWorker, removeTaskFromWorkerArray, addWorkerTaskWithStatus, updateTotalTaskProgress, sendWorkerMessage, hashObjId;
[getUserTypeObject, taskFindOne, findJobByWorker, removeTaskFromWorkerArray, addWorkerTaskWithStatus, updateTotalTaskProgress, sendWorkerMessage, hashObjId] = moduleDependencies.assignDependantVariables(dependants);

var taskId = null;

module.exports.quitTask = function(req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    taskId = req.body.taskId;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var taskJob = findJobByWorker(task, typeObj);
      if (!taskJob) {
        return res.status(422).send({
          message: 'You are not a worker for this task'
        });
      }
      if (taskJob.status === 'submitted') {
        return res.status(422).send({
          message: 'Your task is marked complete, please wait for the task owner to approve your work.'
        });
      }
      if (taskJob.status !== 'active') {
        return res.status(422).send({
          message: 'You are not an active worker for this task.'
        });
      }
      if (!(task.status === 'open' || task.status === 'taken' || task.status === 'suspended')) {
        return res.status(422).send({
          message: 'Task is in a final state, no need to quit.'
        });
      }
      task.jobs[task.jobs.indexOf(taskJob)].status = 'quit';
      task.multiplicity++;
      if (task.status === 'taken') {
        task.status = 'open';
      }
      typeObj = removeTaskFromWorkerArray(task._id, typeObj);
      typeObj = addWorkerTaskWithStatus('fclosed', task._id, typeObj);
      typeObj.save(function(err) {
        if (err)
          return res.status(422).send({ message: errorHandler.getErrorMessage(err) });
        updateTotalTaskProgress(task, function (percent) {
          if (percent.error)
            return res.status(422).send(percent.error);
          sendWorkerMessage('Worker: ' + hashObjId(typeObj._id) + ' has quit this task.', task._id, typeObj._id, null, function (err, message) {
            if (err)
              return res.status(422).send({
                message: 'You have quit the task, but no message was sent.'
              });
            return res.status(200).send({
              message: 'You have quit task: ' + task.title,
              task: task
            });
          });
        });
      });
    });
  });
};
