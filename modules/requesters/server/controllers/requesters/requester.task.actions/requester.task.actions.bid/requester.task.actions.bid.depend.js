'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['findWorkerByWorkerTaskObject', 'removeTaskFromWorkerArray', 'statusPushTo'];
var findWorkerByWorkerTaskObject, removeTaskFromWorkerArray, statusPushTo;
[findWorkerByWorkerTaskObject, removeTaskFromWorkerArray, statusPushTo] = moduleDependencies.assignDependantVariables(dependants);

// sets a worker on work from a bidable task like preapproval or bidding
module.exports.setWorkerOnBidableTask = function(task, workerBidObj, callBack) {
  // find the worker
  findWorkerByWorkerTaskObject(workerBidObj, function (err, workerObj) {
    if (err)
      callBack(errorHandler.getErrorMessage(err));
    // removes from the worker array
    workerObj = removeTaskFromWorkerArray(task._id, workerObj);
    // puts it in active tasks
    workerObj.worker.activeTasks = statusPushTo(task._id, workerObj.worker.activeTasks);
    // reduces overall multiplicity of the task
    --task.multiplicity;
    // sets the task status to taken if multiplicty in zero
    // also sets all bids to rejected
    if (task.multiplicity <= 0) {
      task.status = 'taken';
      task.bids = task.bids.map(function(taskBid) {
        if (taskBid.status !== 'accepted')
          taskBid.status = 'rejected';
        return taskBid;
      });
    }
    // tries to find the bid index
    var found = false;
    var bidIndex = 0;
    while (bidIndex < task.bids.length && !found) {
      if (task.bids[bidIndex].worker.workerId.toString() === workerBidObj.workerId.toString()) {
        found = true;
        break;
      }
      bidIndex++;
    }
    if (!found) {
      return callBack('No bid found.');
    }
    // sets the bid to accepted
    task.bids[bidIndex].status = 'accepted';
    // adds the worker to the jobs array in the task
    task.jobs.push({
      status: 'active',
      worker: task.bids[bidIndex].worker,
      awardAmount: task.bids[bidIndex].bid
    });
    // saves the worker
    workerObj.save(function (err, workerObj) {
      if (err)
        return callBack(errorHandler.getErrorMessage(err));
      // does not save the task
      return callBack(null, task);
    });
  });
};

// extends the task bid depends
_.extend(
  module.exports,
  require('./requester.task.actions.bid.bidable/requester.task.actions.bid.bidable.depend'),
  require('./requester.task.actions.bid.preapproval/requester.task.actions.bid.preapproval.depend')
);
