'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindOne', 'ownsTask', 'setWorkerOnBidableTask', 'setStatus'];
var getUserTypeObject, taskFindOne, ownsTask, setWorkerOnBidableTask, setStatus;
[getUserTypeObject, taskFindOne, ownsTask, setWorkerOnBidableTask, setStatus] = moduleDependencies.assignDependantVariables(dependants);

// accept a preapproval bid
module.exports.acceptPreapproval = function (req, res) {
  // get the type object
  getUserTypeObject(req, res, function(typeObj) {
    // find the task
    taskFindOne(req.body.taskId, function(err, task) {
      if (err)
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      if (!task)
        return res.status(422).send({
          message: 'No task found.'
        });
      // make sure you own the task
      if (!ownsTask(task, typeObj))
        return res.status(422).send({
          message: 'You are not the owner for this task.'
        });
      // make sure its not a bidable task
      if (task.payment.bidding.bidable) {
        return res.status(422).send({
          message: 'This task does not have a static price.'
        });
      }
      // make sure you can hire another worker
      if (task.multiplicity <= 0) {
        return res.status(422).send({
          message: 'There are too many workers for this task.'
        });
      }

      // find the bid index
      var bidId = req.body.bidId,
        foundBid = false,
        bid = 0;

      for (bid = 0; bid < task.bids.length && bidId; bid++) {
        if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
          foundBid = true;
          break;
        }
      }
      if (!foundBid)
        return res.status(422).send({
          message: 'No bid Id found.'
        });
      // set the worker on that bidable task
      setWorkerOnBidableTask(task, task.bids[bid].worker, function (err, task) {
        if (err) {
          return res.status(422).send({
            message: err
          });
        }
        // save the task
        task.save(function(err, task) {
          if (err)
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          // change the status of the task
          setStatus(task._id, task.status, function (err, correctMsg) {
            if (err) {
              return res.status(422).send({
                message: err
              });
            } else {
              return res.status(200).send({
                message: 'Worker Accepted!'
              });
            }
          });
        });
      });
    });
  });
};
