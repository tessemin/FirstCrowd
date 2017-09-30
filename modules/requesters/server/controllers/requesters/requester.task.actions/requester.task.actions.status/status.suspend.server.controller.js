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

// suspend a task
module.exports.suspendTask = function (req, res) {
  // get the tpye object
  getUserTypeObject(req, res, function(typeObj) {
    // find the task
    taskFindOne(req.body.taskId, function (err, task) {
      if (err)
        return res.status(422).send({
          message: err
        });
      // if you own the task
      if (!ownsTask(task, typeObj))
        return res.status(422).send({
          message: 'You are not the owner of this task.'
        });
      // if the task is open or taken you can't suspend
      if (!(task.status === 'taken' || task.status === 'open')) {
        return res.status(422).send({
          message: 'Task is already in a final state.'
        });
      }
      // set status to suspended
      task.status = 'suspended';
      // map the jobs to suspended
      task.jobs = task.jobs.map(function(job) {
        if (job.status === 'active' || job.status === 'submitted') {
          job.status = 'suspended';
          // put this in a function to protect the integrity of the objects
          (function(task, job) {
            // find the worker by type object
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
      // set the status of the reuqester
      setStatusRequester('suspended', task._id, typeObj, function (typeObj) {
        typeObj.save();
      });
      // save the task
      task.save(function(err, task) {
        if (err)
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        // send a message to all the workers
        var numberOfJobsSent = 0;
        var errIds = [];
        // decalres a function to be called later
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
        // if you have task jobs
        if (task.jobs.length > 0) {
          // for each suspended job
          task.jobs.forEach(function(job) {
            if (job.status === 'suspended')
              // send a message
              sendRequesterMessage('Task: ' + task.title + ' has been suspended, please stop work.', task._id, job.worker.workerId, null, function(err) {
                sendJob(err, job.worker.workerId);
              });
            else
              // else complete
              sendJob();
          });
        } else { // if no jobs
          // complete
          sendJob();
        }
      });
    });
  });
};
// unsuspend a task
module.exports.unsuspendTask = function (req, res) {
  // get the type object
  getUserTypeObject(req, res, function(typeObj) {
    // find the task
    taskFindOne(req.body.taskId, function (err, task) {
      if (err)
        return res.status(422).send({
          message: err
        });
      // make sure you own the task
      if (!ownsTask(task, typeObj))
        return res.status(422).send({
          message: 'You are not the owner of this task.'
        });
      // make sure the task is actually already suspended
      if (task.status !== 'suspended') {
        return res.status(422).send({
          message: 'This task is not suspended.'
        });
      }
      // check what status to put the task
      if (task.multiplicity > 0)
        task.status = 'open';
      else
        task.status = 'taken';
      // for each task job if they were suspended map the to active
      task.jobs = task.jobs.map(function(job) {
        if (job.status === 'suspended') {
          job.status = 'active';
          // put this in a function to protect the intergrity of the object
          (function(task, job) {
            // find the worker and put the task in the currect array
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
      // set the status of the requester
      setStatusRequester(task.status, task._id, typeObj, function (typeObj) {
        typeObj.save();
      });
      // save the task
      task.save(function(err, task) {
        if (err)
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        var numberOfJobsSent = 0;
        var errIds = [];
        // send a message to all the workers, this function is called later
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
        // if there are jobs
        if (task.jobs.length > 0) {
          task.jobs.forEach(function(job) {
            // for each actve job send a message
            if (job.status === 'active')
              sendRequesterMessage('Task: ' + task.title + ' has been reactivated, please re-start work!.', task._id, job.worker.workerId, null, function(err) {
                sendJob(err, job.worker.workerId);
              });
            else // else just coount the worker
              sendJob();
          });
        } else { // else no jobs, complete
          sendJob();
        }
      });
    });
  });
};
