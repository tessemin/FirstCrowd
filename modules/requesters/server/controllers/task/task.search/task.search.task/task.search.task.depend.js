'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['findTypeObjByTaskTypeObj'];
var findTypeObjByTaskTypeObj;
[findTypeObjByTaskTypeObj] = moduleDependencies.assignDependantVariables(dependants);

// finds the worker embended in the task
module.exports.findTaskWorker = function(task, worker) {
  var job = findJobByWorker(task, worker);
  if (job)
    return job.worker;
  return false;
};

// gets the job for the worker embended in the task
function findJobByWorker(task, worker) {
  var index = findJobIndex(task.jobs, worker._id);
  if (index < 0)
    return false;
  return task.jobs[index];
}
module.exports.findJobByWorker = findJobByWorker;

// finds the index for the job the worker is working in the task
function findJobIndex(jobs, workerId) {
  var jobIndex = 0,
    jobsLength = jobs.length;
  while (jobIndex < jobsLength) {
    if (jobs[jobIndex].worker.workerId.toString() === workerId.toString())
      break;
    jobIndex++;
  }
  if (!(jobIndex < jobsLength)) {
    return -1;
  }
  return jobIndex;
}
module.exports.findJobIndex = findJobIndex;

// finds the bid the worker bidded on
module.exports.findBidByWorker = function(task, worker) {
  if (task && task.bids && worker)
    for (var i = 0; i < task.bids.length; i++) {
      if (task.bids[i] && task.bids[i].worker && task.bids[i].worker.workerId)
        if (task.bids[i].worker.workerId.toString() === worker._id.toString()) {
          return task.bids[i];
        }
    }
  return false;
};

// finds the task requester/owner
module.exports.findRequesterByTask = function(task, callBack) {
  if (task) {
    findTypeObjByTaskTypeObj(task.requester, callBack);
  } else {
    return callBack('Must provide a task');
  }
};

// takes the worker object embeded in a tasks and finds the worker object
module.exports.findWorkerByWorkerTaskObject = function(workerTaskObj, callBack) {
  findTypeObjByTaskTypeObj(workerTaskObj, callBack);
};
/**** THIS FUNCTION NEEDS TO BE REFACTORED ****/
// finds the worker/requester from the embedded object in the task
module.exports.findTypeObjByTaskTypeObj = function(taskTypeObj, callBack) {
  if (!taskTypeObj) {
    return callBack('No type object provided.');
  }
  var type = '';
  if (taskTypeObj.workerType && !taskTypeObj.requesterType)
    type = 'worker';
  else if (!taskTypeObj.workerType && taskTypeObj.requesterType)
    type = 'requester';
  else
    return callBack('Can\'t be both a worker and a requester.');

  // if enterprise is specified
  if (taskTypeObj[type + 'Type'].enterprise && !taskTypeObj[type + 'Type'].individual) {
    Enterprise.findById(taskTypeObj[type + 'Id'], function (err, obj) {
      if (err) {
        return callBack(errorHandler.getErrorMessage(err));
      }
      if (obj)
        return callBack(null, obj);
      else
        return callBack('no ' + type + ' found');
    });
  // if individual is specified
  } else if (taskTypeObj[type + 'Type'].individual && !taskTypeObj[type + 'Type'].enterprise) {
    Individual.findById(taskTypeObj[type + 'Id'], function (err, obj) {
      if (err) {
        return callBack(errorHandler.getErrorMessage(err));
      }
      if (obj)
        return callBack(null, obj);
      else
        return callBack('no ' + type + ' found');
    });
  } else { // if neother is specified we search both
    Enterprise.findById(taskTypeObj[type + 'Id'], function (err, obj) {
      if (err) {
        return callBack(errorHandler.getErrorMessage(err));
      }
      if (obj)
        return callBack(null, obj);
      else
        Individual.findById(taskTypeObj[type + 'Id'], function (err, obj) {
          if (err) {
            return callBack(errorHandler.getErrorMessage(err));
          }
          if (obj)
            return callBack(null, obj);
          else
            return callBack('no ' + type + ' found');
        });
    });
  }
};
