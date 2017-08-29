'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  _ = require('lodash');
  
module.exports.removeOldBids = function(bids, workerId) {
  var returnArray = [];
  bids.forEach(function (element) {
    if (element.worker.workerId.toString() !== workerId.toString())
      returnArray.push(element);
  });
  return returnArray;
};

module.exports.isTaskRecomended = function(taskId, typeObj) {
  for (var rec = 0; rec < typeObj.worker.recomendedTasks.length; rec++) {
    if (typeObj.worker.recomendedTasks[rec].taskId.toString() === taskId.toString())
      return true;
  }
  return false;
};

function removeExtraWorkers(task, workerId) {
  if (task) {
    if (Array.isArray(task)) { // multiple tasks
      task = task.map(function(task) {
        return removeExtraWorkers(task, workerId);
      });
    } else { // single task
      var stringWorkerId = workerId.toString();
      if (task.jobs)
        for (var job = 0; job < task.jobs.length; job++)
          if (task.jobs[job].worker.workerId.toString() === stringWorkerId) {
            task.jobs = [task.jobs[job]];
            break;
          }
      if (task.payment && task.payment.bidding && task.payment.bidding.bidable && task.bids && task.bids.length > 0) {
        for (var bid = 0; bid < task.bids.length; bid++) {
          if (task.bids[bid].worker.workerId.toString() === stringWorkerId) {
            task.bids = [task.bids[bid]];
            break;
          }
        }
      }
    }
  }
  return task;
}
module.exports.removeExtraWorkers = removeExtraWorkers;

_.extend(
  module.exports,
  require('./worker.task.actions.crud/worker.task.actions.crud.depend'),
  require('./worker.task.actions.job/worker.task.actions.job.depend')
);
