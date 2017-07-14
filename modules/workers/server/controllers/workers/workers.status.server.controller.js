'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  _ = require('lodash');

var getUserTypeObject = taskTools.getUserTypeObject,
  setStatus = taskTools.setStatus,
  isWorker = taskTools.isWorker,
  removeTaskFromWorkerArray = taskTools.removeTaskFromWorkerArray,
  statusPushTo = taskTools.statusPushTo,
  taskFindOne = taskSearch.taskFindOne;

exports.takeTask = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    if (isWorker(req.user) && typeObj.worker) {
      addWorkerToTask(req.body.taskId, req, typeObj, function (err, task, typeObj) {
        if (err) {
          return res.status(422).send({
            message: err
          });
        }
        typeObj.save(function(err, typeObj) {
          if (err)
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          console.log(task)
          task.save(function(err, task) {
            if (task.multiplicity <= 0) {
              setStatus(req.body.taskId, 'taken', function (err, correctMsg) {
                if (err) {
                  return res.status(422).send({
                    message: err
                  });
                } else {
                  return res.status(200).send({
                    message: 'You are now a worker for task ' + task.title
                  });
                }
              });
            } else {
              return res.status(200).send({
                message: 'You are now a worker for task ' + task.title
              });
            }
          });
        });
      });
    } else {
      return res.status(422).send({
        message: 'No worker found'
      });
    }
  });
};

function addWorkerToTask(taskId, req, typeObj, callBack) {
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
      } else if (workerBid > task.payment.bidding.startingPrice) {
        return callBack('Bid must be less than starting price');
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
}

function removeOldBids(bids, workerId) {
  var returnArray = [];
  bids.forEach(function (element) {
    if (element.worker.workerId.toString() !== workerId.toString())
      returnArray.push(element)
  });
  return returnArray;
}

function isTaskRecomended(taskId, typeObj) {
  for (var rec = 0; rec < typeObj.worker.recomendedTasks.length; rec++) {
    if (typeObj.worker.recomendedTasks[rec].taskId.toString() === taskId.toString())
      return true;
  }
  return false;
}
