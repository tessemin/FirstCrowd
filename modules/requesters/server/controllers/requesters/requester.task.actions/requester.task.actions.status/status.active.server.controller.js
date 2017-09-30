'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  paypal = require('paypal-rest-sdk'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindOne', 'ownsTask', 'setStatus'];
var getUserTypeObject, taskFindOne, ownsTask, setStatus;
[getUserTypeObject, taskFindOne, ownsTask, setStatus] = moduleDependencies.assignDependantVariables(dependants);

// gets the payment handler in core
var paymentHandler = require(path.resolve('./modules/core/server/controllers/payment.server.controller'));
var createPaypalPayment = paymentHandler.createPaypalPayment;
var executePaypalPayment = paymentHandler.executePaypalPayment;

// to active a bidable task we only need to active it
// activate a bidable tasak
module.exports.activateBidableTask = function (req, res) {
  // get your type obj
  getUserTypeObject(req, res, function(typeObj) {
    // find the task
    taskFindOne(req.body.taskId, function (err, task) {
      // if you own the task
      if (ownsTask(task, typeObj)) {
        // set the status of the task to open
        setStatus(task._id, 'open', function(err, correctMessage) {
          if (err)
            return res.status(422).send({
              message: err
            });
          else
            // return the task id
            return res.status(200).send({
              taskId: task._id
            });
        });
      } else {
        return res.status(422).send({
          message: 'You are not the owner of this task'
        });
      }
    });
  });
};

// for preapproval or a non-bidding task
// activate a task
var activateTask = {
  // create the payment
  create: function (req, res) {
    // get your tpye object
    getUserTypeObject(req, res, function(typeObj) {
      // find the task
      taskFindOne(req.body.taskId, function(err, task) {

        if (err)
          return res.status(422).send(errorHandler.getErrorMessage(err));
        // make sure you own this task
        if (!ownsTask(task, typeObj))
          return res.status(422).send('You are not the owner for this task.');
        // set payment to true
        if (task.payment.paymentInfo.paid === true) {
          return res.status(422).send('Payment for task already received.');
        }
        // make sure task has a static price
        if (task.payment.bidding && task.payment.bidding.bidable && task.payment.staticPrice) {
          return res.status(422).send('This task does not have a static price.');
        }
        // set the payment ledger for the user
        var items = [{
          'name': 'Workers',
          'sku': task._id,
          'price': task.payment.staticPrice,
          'currency': 'USD',
          'quantity': task.multiplicity
        }];
        // create the payment
        createPaypalPayment(items, task.description, function(err, createdPayment) {
          if (err)
            return res.status(422).send(err);
          else {
            // set some task payment information
            task.payment.paymentInfo.paymentType = 'paypal';
            task.payment.paymentInfo.paymentId = createdPayment.id;
            task.payment.paymentInfo.paymentObject = createdPayment;
            // save the payment
            task.save(function(err, task) {
              if (err)
                res.status(422).send(errorHandler.getErrorMessage(err));
              // send the payment object
              return res.status(201).send({ paymentID: createdPayment.id, taskId: task._id });
            });
          }
        });
      });
    });
  },
  // execute the payment
  execute: function (req, res) {
    // get your type object
    getUserTypeObject(req, res, function(typeObj) {
      // find the task
      taskFindOne(req.body.taskId, function(err, task) {
        if (err)
          return res.status(422).send(errorHandler.getErrorMessage(err));
        // if you own the task
        if (!ownsTask(task, typeObj))
          return res.status(422).send('You are not the owner for this task.');
        // if you have created the payment
        if (!task.payment.paymentInfo || !task.payment.paymentInfo.paymentId)
          return res.status(422).send('No payment has been created.');
        // make sure this task has a static price
        if (task.payment.bidding.bidable) {
          return res.status(422).send('This task does not have a static price.');
        }
        // get the transaction list
        var transactions = [];
        var total = 0;
        for (var trans = 0; trans < task.payment.paymentInfo.paymentObject.transactions.length; trans++) {
          transactions.push({ amount: task.payment.paymentInfo.paymentObject.transactions[trans].amount });
          total += task.payment.paymentInfo.paymentObject.transactions[trans].amount.total;
        }
        // make sure price hasn't been tampered with
        if (parseFloat(total) !== task.payment.staticPrice * task.multiplicity)
          return res.status(422).send('Payment object total does not match actual total.');
        // execute the payment
        executePaypalPayment(req.body.payerID, req.body.paymentID, transactions, function(err, payment) {
          // set some payment information
          task.payment.paymentInfo.paid = true;
          task.payment.paymentInfo.payerId = req.body.payerID;
          task.payment.paymentInfo.paymentObject = payment;
          // save the task
          task.save(function(err, task) {
            if (err)
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            // set the task status to open
            setStatus(task._id, 'open', function (err, correctMsg) {
              if (err) {
                return res.status(422).send(err);
              } else {
                // return a correct message
                return res.status(200).send(correctMsg);
              }
            });
          });
        });
      });
    });
  }
};

module.exports.activatePreapprovalTask = activateTask;
module.exports.activateTask = activateTask;
