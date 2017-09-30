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

// quit a task you are working on
module.exports.quitTask = function(req, res) {
  // get the type object
  getUserTypeObject(req, res, function(typeObj) {
    // find the task
    taskId = req.body.taskId;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      // find the job you are working on
      var taskJob = findJobByWorker(task, typeObj);
      if (!taskJob) {
        return res.status(422).send({
          message: 'You are not a worker for this task'
        });
      }
      // if you have already submitted
      if (taskJob.status === 'submitted') {
        return res.status(422).send({
          message: 'Your task is marked complete, please wait for the task owner to approve your work.'
        });
      }
      // if you are active
      if (taskJob.status !== 'active') {
        return res.status(422).send({
          message: 'You are not an active worker for this task.'
        });
      }
      // if task is already closed
      if (!(task.status === 'open' || task.status === 'taken' || task.status === 'suspended')) {
        return res.status(422).send({
          message: 'Task is in a final state, no need to quit.'
        });
      }
      // set your status to quit
      task.jobs[task.jobs.indexOf(taskJob)].status = 'quit';
      // increase task multiplicity
      task.multiplicity++;
      // set status to open if taken
      if (task.status === 'taken') {
        task.status = 'open';
      }
      // remove from your active tasks
      typeObj = removeTaskFromWorkerArray(task._id, typeObj);
      typeObj = addWorkerTaskWithStatus('fclosed', task._id, typeObj);
      // save your type object
      typeObj.save(function(err) {
        if (err)
          return res.status(422).send({ message: errorHandler.getErrorMessage(err) });
        // update total progress
        updateTotalTaskProgress(task, function (percent) {
          if (percent.error)
            return res.status(422).send(percent.error);
          // send a message to the requester
          sendWorkerMessage('Worker: ' + hashObjId(typeObj._id) + ' has quit this task.', task._id, typeObj._id, null, function (err, message) {
            if (err)
              return res.status(422).send({
                message: 'You have quit the task, but no message was sent.'
              });
            // return
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
