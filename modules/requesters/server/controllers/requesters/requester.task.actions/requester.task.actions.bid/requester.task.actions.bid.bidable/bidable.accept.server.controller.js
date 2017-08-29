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

var paymentHandler = require(path.resolve('./modules/core/server/controllers/payment.server.controller'));
var createPaypalPayment = paymentHandler.createPaypalPayment;
var executePaypalPayment = paymentHandler.executePaypalPayment;

module.exports.acceptBid = {
  create: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function(err, task) {
        if (err)
          return res.status(422).send(errorHandler.getErrorMessage(err));

        if (!ownsTask(task, typeObj))
          return res.status(422).send('You are not the owner for this task.');

        if (!task.payment.bidding.bidable)
          return res.status(422).send('This is not a bidable task.');

        var bidId = req.body.bidId,
          foundBid = false,
          bid = 0;
        if (task.multiplicity <= 0) {
          return res.status(422).send('There are too many workers for this task.');
        }

        for (bid = 0; bid < task.bids.length && bidId; bid++) {
          if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
            foundBid = true;
            break;
          }
        }
        if (!foundBid)
          return res.status(422).send('No bid Id found.');

        for (var job = 0; job < task.jobs.length; job++) {
          if (task.jobs[job].worker.workerId.toString() === task.bids[bid].worker.workerId.toString()) {
            return res.status(422).send('Worker is already working for this task');
          }
        }

        var items = [{
          'name': 'Worker',
          'sku': bidId,
          'price': task.bids[bid].bid,
          'currency': 'USD',
          'quantity': 1
        }];
        createPaypalPayment(items, task.description, function(err, createdPayment) {
          if (err)
            return res.status(422).send(err);
          else {
            task.payment.paymentInfo.paymentType = 'paypal';
            task.payment.paymentInfo.paymentId = createdPayment.id;
            task.payment.paymentInfo.paymentObject = createdPayment;
            task.save(function(err, task) {
              if (err)
                res.status(422).send(errorHandler.getErrorMessage(err));
              return res.status(201).send({ paymentID: createdPayment.id, taskId: task._id });
            });
          }
        });
      });
    });
  },
  execute: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function(err, task) {
        if (err)
          return res.status(422).send(errorHandler.getErrorMessage(err));

        if (!ownsTask(task, typeObj))
          return res.status(422).send('You are not the owner for this task.');

        if (!task.payment.paymentInfo || !task.payment.paymentInfo.paymentId)
          return res.status(422).send('No payment has been created.');

        if (!task.payment.bidding.bidable)
          return res.status(422).send('This is not a bidable task.');

        var bidId = req.body.bidId,
          foundBid = false,
          bid = 0;

        if (task.multiplicity <= 0) {
          return res.status(422).send('There are too many workers for this task.');
        }

        for (bid = 0; bid < task.bids.length && bidId; bid++) {
          if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
            foundBid = true;
            break;
          }
        }
        if (!foundBid)
          return res.status(422).send('No bid Id found.');

        for (var job = 0; job < task.jobs.length; job++) {
          if (task.jobs[job].worker.workerId.toString() === task.bids[bid].worker.workerId.toString()) {
            return res.status(422).send('Worker is already working for this task');
          }
        }
        
        var transactions = [];
        var total = 0;
        for (var trans = 0; trans < task.payment.paymentInfo.paymentObject.transactions.length; trans++) {
          transactions.push({ amount: task.payment.paymentInfo.paymentObject.transactions[trans].amount });
          total += task.payment.paymentInfo.paymentObject.transactions[trans].amount.total;
        }

        if (parseFloat(total) !== task.bids[bid].bid)
          return res.status(422).send('Payment object total does not match actual total.');

        executePaypalPayment(req.body.payerID, req.body.paymentID, transactions, function(err, payment) {
          if (err)
            return res.status(422).send(errorHandler.getErrorMessage(err));
          setWorkerOnBidableTask(task, task.bids[bid].worker, function (err, task) {
            if (err)
              return res.status(422).send(err);
            task.payment.paymentInfo.paid = true;
            task.payment.paymentInfo.payerId = req.body.payerID;
            task.payment.paymentInfo.paymentObject = payment;
            task.save(function(err, task) {
              if (err)
                return res.status(422).send(errorHandler.getErrorMessage(err));
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
