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

// gets the payment handler from module core
var paymentHandler = require(path.resolve('./modules/core/server/controllers/payment.server.controller'));
var createPaypalPayment = paymentHandler.createPaypalPayment;
var executePaypalPayment = paymentHandler.executePaypalPayment;

// this export allows for us to accept a bidable bid
// we have to get payment for this bid before we can allow work to start
module.exports.acceptBid = {
  // create the payment
  create: function (req, res) {
    // gett the use obj
    getUserTypeObject(req, res, function(typeObj) {
      // find the task
      taskFindOne(req.body.taskId, function(err, task) {
        if (err)
          return res.status(422).send(errorHandler.getErrorMessage(err));
        // check if you own the task
        if (!ownsTask(task, typeObj))
          return res.status(422).send('You are not the owner for this task.');
        // check if it is infact a bidable task
        if (!task.payment.bidding.bidable)
          return res.status(422).send('This is not a bidable task.');
        // check if there are too many workers for this task
        if (task.multiplicity <= 0)
          return res.status(422).send('There are too many workers for this task.');

        // find the bid index stored in bid
        var bidId = req.body.bidId,
          foundBid = false,
          bid = 0;

        for (bid = 0; bid < task.bids.length && bidId; bid++) {
          if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
            foundBid = true;
            break;
          }
        }
        // return if there is no bid
        if (!foundBid)
          return res.status(422).send('No bid Id found.');

        // check if the worker is already a worker, just a double check
        for (var job = 0; job < task.jobs.length; job++) {
          if (task.jobs[job].worker.workerId.toString() === task.bids[bid].worker.workerId.toString()) {
            return res.status(422).send('Worker is already working for this task');
          }
        }
        // outline what the requester is payfor
        var items = [{
          'name': 'Worker',
          'sku': bidId,
          'price': task.bids[bid].bid,
          'currency': 'USD',
          'quantity': 1
        }];
        // create and return the actual payment
        createPaypalPayment(items, task.description, function(err, createdPayment) {
          if (err)
            return res.status(422).send(err);
          else {
            // sets the task payment info
            task.payment.paymentInfo.paymentType = 'paypal';
            task.payment.paymentInfo.paymentId = createdPayment.id;
            task.payment.paymentInfo.paymentObject = createdPayment;
            // save the task
            task.save(function(err, task) {
              if (err)
                res.status(422).send(errorHandler.getErrorMessage(err));
              // return the payment info
              return res.status(201).send({ paymentID: createdPayment.id, taskId: task._id });
            });
          }
        });
      });
    });
  },
  // executes a created payment
  execute: function (req, res) {
    // get the user obj
    getUserTypeObject(req, res, function(typeObj) {
      // finds the task
      taskFindOne(req.body.taskId, function(err, task) {
        if (err)
          return res.status(422).send(errorHandler.getErrorMessage(err));
        // checks if you own the task
        if (!ownsTask(task, typeObj))
          return res.status(422).send('You are not the owner for this task.');
        // checks to make sure you have payment information
        if (!task.payment.paymentInfo || !task.payment.paymentInfo.paymentId)
          return res.status(422).send('No payment has been created.');
        // double checks to make sure its bidable
        if (!task.payment.bidding.bidable)
          return res.status(422).send('This is not a bidable task.');
        // checks to make sure you can hire another worker
        if (task.multiplicity <= 0) {
          return res.status(422).send('There are too many workers for this task.');
        }

        // finds the bid index
        var bidId = req.body.bidId,
          foundBid = false,
          bid = 0;
        for (bid = 0; bid < task.bids.length && bidId; bid++) {
          if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
            foundBid = true;
            break;
          }
        }
        // return if not bid index is found
        if (!foundBid)
          return res.status(422).send('No bid Id found.');
        // check if that worker is already working
        for (var job = 0; job < task.jobs.length; job++) {
          if (task.jobs[job].worker.workerId.toString() === task.bids[bid].worker.workerId.toString()) {
            return res.status(422).send('Worker is already working for this task');
          }
        }
        // gets the transactions from the task objects
        var transactions = [];
        var total = 0;
        for (var trans = 0; trans < task.payment.paymentInfo.paymentObject.transactions.length; trans++) {
          transactions.push({ amount: task.payment.paymentInfo.paymentObject.transactions[trans].amount });
          total += task.payment.paymentInfo.paymentObject.transactions[trans].amount.total;
        }
        // check and make sure the payment object hasn't been modified
        if (parseFloat(total) !== task.bids[bid].bid)
          return res.status(422).send('Payment object total does not match actual total.');
        // execute the payment
        executePaypalPayment(req.body.payerID, req.body.paymentID, transactions, function(err, payment) {
          if (err)
            return res.status(422).send(errorHandler.getErrorMessage(err));
          // set the bider as a worker for the task in the jobs field
          setWorkerOnBidableTask(task, task.bids[bid].worker, function (err, task) {
            if (err)
              return res.status(422).send(err);
            // finish set up for the task
            task.payment.paymentInfo.paid = true;
            task.payment.paymentInfo.payerId = req.body.payerID;
            task.payment.paymentInfo.paymentObject = payment;
            // save the task
            task.save(function(err, task) {
              if (err)
                return res.status(422).send(errorHandler.getErrorMessage(err));
              // set the task status
              setStatus(task._id, task.status, function (err, correctMsg) {
                if (err) {
                  return res.status(422).send(err);
                } else {
                  return res.status(200).send(correctMsg);
                }
              });
            });
          });
        });
      });
    });
  }
};
