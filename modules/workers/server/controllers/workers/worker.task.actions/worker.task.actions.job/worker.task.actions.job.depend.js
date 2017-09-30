'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['taskFindOne', 'isTaskRecomended', 'removeTaskFromWorkerArray', 'removeOldBids', 'statusPushTo'];
var taskFindOne, isTaskRecomended, removeTaskFromWorkerArray, removeOldBids, statusPushTo;
[taskFindOne, isTaskRecomended, removeTaskFromWorkerArray, removeOldBids, statusPushTo] = moduleDependencies.assignDependantVariables(dependants);

// this will either bid or add you to the tasak depending on the task type
module.exports.addWorkerToTask = function(taskId, req, typeObj, callBack) {
  // findn the task
  taskFindOne(taskId, function(err, task) {
    if (err)
      return callBack(errorHandler.getErrorMessage(err));
    if (!task)
      return callBack('No task found');
    // if the task is secret and not recomended, let them know they can't work on that task
    if (task.secret && !isTaskRecomended(task._id, typeObj))
      return callBack('You don\'t have permission to work on that task');
    // make sure you can have another worker
    if (task.multiplicity <= 0)
      return callBack('There are too many workers for this task');
    var bid = null;
    // **** FOR BIDDING ****
    if (task.payment.bidding.bidable) {
      // get the bid
      var workerBid = req.body.bid;
      if (!workerBid) {
        return callBack('Please provide a bid for this task');
      // if it is less than the minumum price send an error
      } else if (workerBid < task.payment.bidding.minPrice) {
        return callBack('Bid must be greater than minimum price');
      } else {
        // build the bid object
        bid = {
          worker: {
            workerId: typeObj._id
          },
          bid: workerBid
        };
        // set the worker type
        bid.worker.workerType = {};
        if (req.user.enterprise && !req.user.individual)
          bid.worker.workerType.enterprise = true;
        else if (req.user.individual && !req.user.enterprise)
          bid.worker.workerType.individual = true;
        // remove your old bids
        task.bids = removeOldBids(task.bids, typeObj._id);
        task.bids.push(bid);
        // return
        return callBack(null, task, typeObj);
      }
    } else if (task.preapproval) { // **** FOR REQUIRE PREAPPROVAL ****
      // build the bid object with a static price
      bid = {
        worker: {
          workerId: typeObj._id
        },
        bid: task.payment.staticPrice
      };
      // set the worker type
      bid.worker.workerType = {};
      if (req.user.enterprise && !req.user.individual)
        bid.worker.workerType.enterprise = true;
      else if (req.user.individual && !req.user.enterprise)
        bid.worker.workerType.individual = true;
      // remove old bids
      task.bids = removeOldBids(task.bids, typeObj._id);
      task.bids.push(bid);
      // return
      return callBack(null, task, typeObj);
    } else { // **** STATIC PRICE, NO PREAPROVAL ****
      // remove this task from your worker arrays
      typeObj = removeTaskFromWorkerArray(task._id, typeObj);
      // add this task to your worker as active
      typeObj.worker.activeTasks = statusPushTo(task._id, typeObj.worker.activeTasks);
      // decrement the multiplicity
      --task.multiplicity;
      // build the job object
      var job = {
        status: 'active',
        worker: {
          workerId: typeObj._id
        },
        awardAmount: task.payment.staticPrice
      };
      job.dateStarted = Date.now();
      // get the worker type
      job.worker.workerType = {};
      if (req.user.enterprise && !req.user.individual)
        job.worker.workerType.enterprise = true;
      else if (req.user.individual && !req.user.enterprise)
        job.worker.workerType.individual = true;
      // add the job to the task
      task.jobs.push(job);

      return callBack(null, task, typeObj);
    }
  });
};
