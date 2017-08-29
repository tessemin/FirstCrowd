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

var paymentHandler = require(path.resolve('./modules/core/server/controllers/payment.server.controller'));
var createPaypalPayment = paymentHandler.createPaypalPayment;
var executePaypalPayment = paymentHandler.executePaypalPayment;

module.exports.activateBidableTask = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    taskFindOne(req.body.taskId, function (err, task) {
      if (ownsTask(task, typeObj)) {
        setStatus(task._id, 'open', function(err, correctMessage) {
          if (err)
            return res.status(422).send({
              message: err
            });
          else
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
var activateTask = {
  create: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function(err, task) {

        if (err)
          return res.status(422).send(errorHandler.getErrorMessage(err));

        if (!ownsTask(task, typeObj))
          return res.status(422).send('You are not the owner for this task.');

        if (task.payment.paymentInfo.paid === true) {
          return res.status(422).send('Payment for task already received.');
        }

        if (task.payment.bidding && task.payment.bidding.bidable && task.payment.staticPrice) {
          return res.status(422).send('This task does not have a static price.');
        }

        var items = [{
          'name': 'Workers',
          'sku': task._id,
          'price': task.payment.staticPrice,
          'currency': 'USD',
          'quantity': task.multiplicity
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

        if (task.payment.bidding.bidable) {
          return res.status(422).send('This task does not have a static price.');
        }

        var transactions = [];
        var total = 0;
        for (var trans = 0; trans < task.payment.paymentInfo.paymentObject.transactions.length; trans++) {
          transactions.push({ amount: task.payment.paymentInfo.paymentObject.transactions[trans].amount });
          total += task.payment.paymentInfo.paymentObject.transactions[trans].amount.total;
        }

        if (parseFloat(total) !== task.payment.staticPrice * task.multiplicity)
          return res.status(422).send('Payment object total does not match actual total.');

        executePaypalPayment(req.body.payerID, req.body.paymentID, transactions, function(err, payment) {
          task.payment.paymentInfo.paid = true;
          task.payment.paymentInfo.payerId = req.body.payerID;
          task.payment.paymentInfo.paymentObject = payment;
          task.save(function(err, task) {
            if (err)
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            setStatus(task._id, 'open', function (err, correctMsg) {
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
  }
};

module.exports.activatePreapprovalTask = activateTask;
module.exports.activateTask = activateTask;
