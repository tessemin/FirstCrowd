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

module.exports.setWorkerOnBidableTask = function(task, workerBidObj, callBack) {
  findWorkerByWorkerTaskObject(workerBidObj, function (err, workerObj) {
    if (err)
      callBack(errorHandler.getErrorMessage(err));

    workerObj = removeTaskFromWorkerArray(task._id, workerObj);
    workerObj.worker.activeTasks = statusPushTo(task._id, workerObj.worker.activeTasks);
    --task.multiplicity;
    if (task.multiplicity <= 0) {
      task.status = 'taken';
      task.bids = task.bids.map(function(taskBid) {
        if (taskBid.status !== 'accepted')
          taskBid.status = 'rejected';
        return taskBid;
      });
    }
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
    task.bids[bidIndex].status = 'accepted';
    task.jobs.push({
      status: 'active',
      worker: task.bids[bidIndex].worker,
      awardAmount: task.bids[bidIndex].bid
    });
    workerObj.save(function (err, workerObj) {
      if (err)
        return callBack(errorHandler.getErrorMessage(err));
      return callBack(null, task);
    });
  });
};

_.extend(
  module.exports,
  require('./requester.task.actions.bid.bidable/requester.task.actions.bid.bidable.depend'),
  require('./requester.task.actions.bid.preapproval/requester.task.actions.bid.preapproval.depend')
);
