'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  taskTools = require(path.resolve('./modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  paymentPaypal = require(path.resolve('./modules/core/server/controllers/payment/paypal.server.controller.js')),
  _ = require('lodash');

// imported functions
var getUserTypeObject = taskTools.getUserTypeObject,
  isRequester = taskTools.isRequester,
  statusPushTo = taskTools.statusPushTo,
  setStatus = taskTools.setStatus,
  ownsTask = taskTools.ownsTask,
  taskFindOne = taskSearch.taskFindOne;

// imported payment functions
var createPaypalPayment = paymentPaypal.createPaypalPayment,
  executePaypalPayment = paymentPaypal.executePaypalPayment;


// local variables
var taskId = null;
  
exports.taskActions = {
  create: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      // user is signed in a requester
      if (isRequester(req.user)) {
        if (req.body.skillsNeeded) {
          req.body.skillsNeeded = req.body.skillsNeeded.split(',');
        }
        var newTask = new Task(req.body);
        if (req.user.enterprise) {
          newTask.requester.requesterType.enterprise = true;
          newTask.requester.requesterId = typeObj._id;
        } else if (req.user.individual) {
          newTask.requester.requesterType.individual = true;
          newTask.requester.requesterId = typeObj._id;
        } else {
          return res.status(400).send({
            message: 'You do not have that type access'
          });
        }
        newTask.dateCreated = Date.now();
        typeObj.requester.suspendedTasks = statusPushTo(newTask, typeObj.requester.suspendedTasks);
        typeObj.save(function (typeErr, typeObj) {
          if (typeErr) {
            return res.status(422).send({
              message: 'Error connecting your profile with task: ' + newTask.title
            });
          } else {
            newTask.save(function (err, task) {
              if (err) {
                return res.status(422).send({
                  message: 'Error creating task: ' + newTask.title
                });
              } else {
                return res.status(200).send({
                  taskId: task._id,
                  message: 'New task: ' + task.title + ' created successfully'
                });
              }
            });
          }
        });
      } else {
        return res.status(422).send({
          message: 'You are not a requester'
        });
      }
    });
  },
  delete: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        taskId = req.body.taskId;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (!task)
            return res.status(422).send({
              message: 'No task found'
            });
          if (!task.requester || !task.requester.requesterId)
            return res.status(422).send({
              message: 'No owner for this task'
            });
          if (ownsTask(task, typeObj)) {
            if (!task.jobs || task.jobs.length <= 0) {
              Task.findByIdAndRemove(taskId, function (err, task) {
                if (err) {
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  return res.status(200).send({
                    message: 'Task ' + task.title + ' deleted successfully',
                    taskId: task._id
                  });
                }
              });
            } else {
              return res.status(422).send({
                message: 'Workers are working on that task\nPlease set status to suspended and resolve any conflicts'
              });
            }
          } else {
            return res.status(422).send({
              message: 'You are not the owner of this task'
            });
          }
        });
      } else {
        return res.status(422).send({
          message: 'You are not a requester'
        });
      }
    });
  },
  update: function(req, res) {
    /* getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        taskId = req.body.taskId;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task.requester.requesterId.toString() === typeObj._id.toString()) {
            // if we are updating the status, make sure we keep the requester and task in same state
            task = _.extend(task, _.pick(req.body, taskWhiteListedFields));
              task.save(function(err) {
                if (err) {
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else if (taskWhiteListedFields.indexOf('status') > -1 && req.body.status) {
                  setStatus(req.body.taskId, req.body.status, typeObj, function (message) {
                    if (message.error) {
                      res.status(422).send({
                        message: message.error
                      });
                    }
                    res.status(200).send({
                      message: 'Update successful'
                    });
                  });
                } else {
                  return res.status(200).send({
                    message: 'Update successful'
                  });
                }
              });
          } else {
            return res.status(422).send({
              message: 'You are not the owner of this task'
            });
          }
        });
      } else {
        return res.status(422).send({
          message: 'You are not a requester'
        });
      }
    }); */
  },
  getWorkerRatingsForTask: function (req, res) {
    taskId = req.body.taskId;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var workerRatings = {};
      if (task.jobs && task.jobs.length > 0) {
        workerRatings.requester = task.requester;
        workerRatings.ratings = [];
        for (var job = 0; job < task.jobs.length; job++) {
          if (task.jobs[job]) {
            if (task.jobs[job].workerRating) {
              workerRatings.ratings.push({
                rating: task.jobs[job].workerRating,
                status: task.jobs[job].status,
                worker: task.jobs[job].worker
              });
            }
          }
        }
      }
      return res.json(workerRatings);
    });
  },
  getRequesterRatingsForTask: function (req, res) {
    taskId = req.body.taskId;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var requesterRatings = {};
      if (task.jobs && task.jobs.length > 0) {
        requesterRatings.requester = task.requester;
        requesterRatings.ratings = [];
        for (var job = 0; job < task.jobs.length; job++) {
          if (task.jobs[job]) {
            if (task.jobs[job].requesterRating && task.jobs[job].progress && task.jobs[job].progress >= 100) {
              requesterRatings.ratings.push({
                rating: task.jobs[job].requesterRating,
                status: task.jobs[job].status,
                worker: task.jobs[job].worker
              });
            }
          }
        }
      }
      res.json(requesterRatings);
    });
  },
  payment: {
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
  }
};
