'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindOne', 'ownsTask', 'findWorkerByWorkerTaskObject', 'removeTaskFromWorkerArray', 'addWorkerTaskWithStatus', 'setStatusRequester', 'hashObjId', 'sendRequesterMessage'];
var getUserTypeObject, taskFindOne, ownsTask, findWorkerByWorkerTaskObject, removeTaskFromWorkerArray, addWorkerTaskWithStatus, setStatusRequester, hashObjId, sendRequesterMessage;
[getUserTypeObject, taskFindOne, ownsTask, findWorkerByWorkerTaskObject, removeTaskFromWorkerArray, addWorkerTaskWithStatus, setStatusRequester, hashObjId, sendRequesterMessage] = moduleDependencies.assignDependantVariables(dependants);

module.exports.suspendTask = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    taskFindOne(req.body.taskId, function (err, task) {
      if (err)
        return res.status(422).send({
          message: err
        });
      if (!ownsTask(task, typeObj))
        return res.status(422).send({
          message: 'You are not the owner of this task.'
        });
      if (!(task.status === 'taken' || task.status === 'open')) {
        return res.status(422).send({
          message: 'Task is already in a final state.'
        });
      }
      task.status = 'suspended';
      task.jobs = task.jobs.map(function(job) {
        if (job.status === 'active' || job.status === 'submitted') {
          job.status = 'suspended';
          (function(task, job) {
            findWorkerByWorkerTaskObject(job.worker, function(err, workerObj) {
              if (!err) {
                workerObj = removeTaskFromWorkerArray(task._id, workerObj);
                workerObj = addWorkerTaskWithStatus(task.status, task._id, workerObj);
                workerObj.save();
              }
            });
          }(task, job));
        }
        return job;
      });
      setStatusRequester('suspended', task._id, typeObj, function (typeObj) {
        typeObj.save();
      });
      task.save(function(err, task) {
        if (err)
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        var numberOfJobsSent = 0;
        var errIds = [];
        function sendJob(err, workerId) {
          if (err)
            errIds.push(hashObjId(workerId));
          numberOfJobsSent++;
          if (numberOfJobsSent >= task.jobs.length) {
            if (errIds.length > 0) {
              return res.status(422).send({
                message: 'Task suspended, but error sending messages to Ids: ' + errIds.join(', ')
              });
            }
            return res.status(200).send({
              message: 'Task: ' + task.title + ' suspended successfully!',
              task: task
            });
          }
        }
        if (task.jobs.length > 0) {
          task.jobs.forEach(function(job) {
            if (job.status === 'suspended')
              sendRequesterMessage('Task: ' + task.title + ' has been suspended, please stop work.', task._id, job.worker.workerId, null, function(err) {
                sendJob(err, job.worker.workerId);
              });
            else
              sendJob();
          });
        } else {
          sendJob();
        }
      });
    });
  });
};

module.exports.unsuspendTask = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    taskFindOne(req.body.taskId, function (err, task) {
      if (err)
        return res.status(422).send({
          message: err
        });
      if (!ownsTask(task, typeObj))
        return res.status(422).send({
          message: 'You are not the owner of this task.'
        });
      if (task.status !== 'suspended') {
        return res.status(422).send({
          message: 'This task is not suspended.'
        });
      }
      if (task.multiplicity > 0)
        task.status = 'open';
      else
        task.status = 'taken';
      
      task.jobs = task.jobs.map(function(job) {
        if (job.status === 'suspended') {
          job.status = 'active';
          (function(task, job) {
            findWorkerByWorkerTaskObject(job.worker, function(err, workerObj) {
              if (!err) {
                workerObj = removeTaskFromWorkerArray(task._id, workerObj);
                workerObj = addWorkerTaskWithStatus(task.status, task._id, workerObj);
                workerObj.save();
              }
            });
          }(task, job));
        }
        return job;
      });
      setStatusRequester(task.status, task._id, typeObj, function (typeObj) {
        typeObj.save();
      });
      task.save(function(err, task) {
        if (err)
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        var numberOfJobsSent = 0;
        var errIds = [];
        function sendJob(err, workerId) {
          if (err)
            errIds.push(hashObjId(workerId));
          numberOfJobsSent++;
          if (numberOfJobsSent >= task.jobs.length) {
            if (errIds.length > 0) {
              return res.status(422).send({
                message: 'Task suspended, but error sending messages to Ids: ' + errIds.join(', ')
              });
            }
            return res.status(200).send({
              message: 'Task: ' + task.title + ' suspended successfully!',
              task: task
            });
          }
        }
        if (task.jobs.length > 0) {
          task.jobs.forEach(function(job) {
            if (job.status === 'active')
              sendRequesterMessage('Task: ' + task.title + ' has been reactivated, please re-start work!.', task._id, job.worker.workerId, null, function(err) {
                sendJob(err, job.worker.workerId);
              });
            else
              sendJob();
          });
        } else {
          sendJob();
        }
      });
    });
  });
};

