'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  paypal = require('paypal-rest-sdk'),
  mongoose = require('mongoose'),
  taskTools = require(path.resolve('./modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  paymentPaypal = require(path.resolve('./modules/core/server/controllers/payment/paypal.server.controller.js')),
  _ = require('lodash');

var getUserTypeObject = taskTools.getUserTypeObject,
  ownsTask = taskTools.ownsTask,
  setStatus = taskTools.setStatus,
  statusPushTo = taskTools.statusPushTo,
  removeTaskFromWorkerArray = taskTools.removeTaskFromWorkerArray,
  findWorkerByWorkerTaskObject = taskSearch.findWorkerByWorkerTaskObject,
  taskFindOne = taskSearch.taskFindOne;

// imported payment functions
var createPaypalPayment = paymentPaypal.createPaypalPayment,
  executePaypalPayment = paymentPaypal.executePaypalPayment;

exports.stateActions = {
  payment: {
    bidable: {
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

            if (parseFloat(total) !== task.payment.staticPrice * task.multiplicity)
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
                task.multiplicity--;
                task.save(function(err, task) {
                  if (err)
                    return res.status(422).send(errorHandler.getErrorMessage(err));
                  var status = 'open';
                  if (task.multiplicity <= 0)
                    status = 'taken';
                  setStatus(task._id, status, function (err, correctMsg) {
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
    },
    create: function (req, res) {
      console.log(req.body);
      getUserTypeObject(req, res, function(typeObj) {
        taskFindOne(req.body.taskId, function(err, task) {

          if (err)
            return res.status(422).send(errorHandler.getErrorMessage(err));

          if (!ownsTask(task, typeObj))
            return res.status(422).send('You are not the owner for this task.');

          if (task.payment.paymentInfo.paid === true) {
            return res.status(422).send('Payment for task already received.');
          }

          if (task.payment.bidding.bidable) {
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
  },
  workerPick: {
    preapproval: {
      accept: function (req, res) {
        getUserTypeObject(req, res, function(typeObj) {
          taskFindOne(req.body.taskId, function(err, task) {
            if (err)
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            if (!task)
              return res.status(422).send({
                message: 'No task found.'
              });
            if (!ownsTask(task, typeObj))
              return res.status(422).send({
                message: 'You are not the owner for this task.'
              });

            if (!task.payment.paymentInfo || !task.payment.paymentInfo.paymentId)
              return res.status(422).send({
                message: 'No payment has been created.'
              });

            if (task.payment.bidding.bidable) {
              return res.status(422).send({
                message: 'This task does not have a static price.'
              });
            }

            var bidId = req.body.bidId,
              foundBid = false,
              bid = 0;
            if (task.multiplicity <= 0) {
              return res.status(422).send({
                message: 'There are too many workers for this task.'
              });
            }

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

            setWorkerOnBidableTask(task, task.bids[bid].worker, function (err, task) {
              if (err) {
                return res.status(422).send({
                  message: err
                });
              }
              task.save(function(err, task) {
                if (err)
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                var status = 'open';
                if (task.multiplicity <= 0)
                  status = 'taken';
                setStatus(task._id, status, function (err, correctMsg) {
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
      }
    },
    rejectBid: function (req, res) {
      getUserTypeObject(req, res, function(typeObj) {
        taskFindOne(req.body.taskId, function (err, task) {
          if (ownsTask(task, typeObj)) {
            var bidId = req.body.bidId;
            var foundBid = false;
            for (var bid = 0; bid < task.bids.length && bidId; bid++) {
              if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
                foundBid = true;
                task.bids[bid].status = 'rejected';
                task.save(function (err, task) {
                  if (err)
                    return res.status(422).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  return res.status(200).send({
                    message: 'Bid rejected successfully.'
                  });
                });
              }
            }
            if (!foundBid)
              return res.status(422).send({
                message: 'No bid with that Id found.'
              });
          } else {
            return res.status(422).send({
              message: 'You are not the owner of this task'
            });
          }
        });
      });
    }
  },
  activateBidableTask: function (req, res) {
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
  }
};

function setWorkerOnBidableTask(task, workerBidObj, callBack) {
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
}
