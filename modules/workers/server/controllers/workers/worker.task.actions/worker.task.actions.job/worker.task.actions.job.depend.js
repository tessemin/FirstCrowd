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
 
module.exports.addWorkerToTask = function(taskId, req, typeObj, callBack) {
  taskFindOne(taskId, function(err, task) {
    if (err)
      return callBack(errorHandler.getErrorMessage(err));
    if (!task)
      return callBack('No task found');
    if (task.secret && !isTaskRecomended(task._id, typeObj))
      return callBack('You don\'t have permission to work on that task');
    if (task.multiplicity <= 0)
      return callBack('There are too many workers for this task');
    var bid = null;
    // FOR BIDDING
    if (task.payment.bidding.bidable) {
      var workerBid = req.body.bid;
      if (!workerBid) {
        return callBack('Please provide a bid for this task');
      } else if (workerBid < task.payment.bidding.minPrice) {
        return callBack('Bid must be greater than minimum price');
      } else {
        bid = {
          worker: {
            workerId: typeObj._id
          },
          bid: workerBid
        };
        bid.worker.workerType = {};
        if (req.user.enterprise && !req.user.individual)
          bid.worker.workerType.enterprise = true;
        else if (req.user.individual && !req.user.enterprise)
          bid.worker.workerType.individual = true;
        
        task.bids = removeOldBids(task.bids, typeObj._id);
        task.bids.push(bid);
        
        return callBack(null, task, typeObj);
      }
    } else if (task.preapproval) { // FOR REQUIRE PREAROVAL
      bid = {
        worker: {
          workerId: typeObj._id
        },
        bid: task.payment.staticPrice
      };
      bid.worker.workerType = {};
      if (req.user.enterprise && !req.user.individual)
        bid.worker.workerType.enterprise = true;
      else if (req.user.individual && !req.user.enterprise)
        bid.worker.workerType.individual = true;
      
      task.bids = removeOldBids(task.bids, typeObj._id);
      task.bids.push(bid);
      
      return callBack(null, task, typeObj);
    } else { // STATIC PRICE, NO PREAPROVAL
      typeObj = removeTaskFromWorkerArray(task._id, typeObj);
      typeObj.worker.activeTasks = statusPushTo(task._id, typeObj.worker.activeTasks);
      --task.multiplicity;
      var job = {
        status: 'active',
        worker: {
          workerId: typeObj._id
        },
        awardAmount: task.payment.staticPrice
      };
      job.dateStarted = Date.now();
      job.worker.workerType = {};
      if (req.user.enterprise && !req.user.individual)
        job.worker.workerType.enterprise = true;
      else if (req.user.individual && !req.user.enterprise)
        job.worker.workerType.individual = true;
      
      task.jobs.push(job);
      
      return callBack(null, task, typeObj);
    }
  });
};
