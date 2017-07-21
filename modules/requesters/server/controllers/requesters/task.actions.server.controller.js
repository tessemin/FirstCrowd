'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  User = mongoose.model('User'),
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
  },
  preapproval: {
    accept: function (req, res) {
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
          if(!foundBid)
            return res.status(422).send('No bid Id found.');
          
          setWorkerOnBidableTask(task, task.bids[bid].worker, function (err, task) {
            task.multiplicity--;
            task.save(function(err, task) {
              if (err)
                return res.status(422).send(errorHandler.getErrorMessage(err));
              var status = 'open';
              if (task.multiplicity <= 0)
                status = 'taken'
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
    }
  }
};

exports.biddingActions = {
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
  },
  rejectBid: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function (err, task) {
        if (ownsTask(task, typeObj)) {
          var bidId = req.body.bidId;
          var foundBid = false;
          for (var bid = 0; bid < task.bids.length && bidId; bid++) {
            if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
              foundBid = true
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
  },
  bidderInfo: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function (err, task) {
        if (err) {
          return res.status(422).send({
            message: err
          });
        }
        if (ownsTask(task, typeObj)) {
          var indBiddersIds = [],
            entBiddersIds = [];
          for (var bid = 0; bid < task.bids.length; bid++) {
            if (task.bids[bid].worker.workerType.enterprise && !task.bids[bid].worker.workerType.individual) {
              entBiddersIds.push(task.bids[bid].worker.workerId);
            } else if (task.bids[bid].worker.workerType.individual && !task.bids[bid].worker.workerType.enterprise) {
              indBiddersIds.push(task.bids[bid].worker.workerId);
            } else {
              indBiddersIds.push(task.bids[bid].worker.workerId);
              entBiddersIds.push(task.bids[bid].worker.workerId);
            }
          }
          getMongoIndividuals(indBiddersIds, function (err, individuals) {
            if (err)
              return res.status(422).send({
                message: err
              });
            getMongoEnterprises(entBiddersIds, function (err, enterprises) {
              if (err)
                return res.status(422).send({
                  message: err
                });
              var safeInds = individuals.map(function(ind) {
                ind = getNestedProperties(ind, individualWhiteListFields);
                console.log(ind)
                ind.displayId = hashTypeObjId(ind._id);
                return ind;
              });
              var safeEnts = enterprises.map(function(ent) {
                ent = getNestedProperties(ent, enterpriseWhiteListFields);
                ent.displayId = hashTypeObjId(ent._id);
                return ent;
              });
              res.json({ individuals: safeInds, enterprises: safeEnts });
            });
          });
        } else {
          return res.status(422).send({
            message: 'You are not the owner of this task'
          });
        }
      });
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
          if(!foundBid)
            return res.status(422).send('No bid Id found.');
          
          for (var job = 0; job < task.jobs.length; job++) {
            if (jobs[job].worker.workerId.toString() === task.bids[bid].worker.workerId.toString()) {
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
          if(!foundBid)
            return res.status(422).send('No bid Id found.');
          
          for (var job = 0; job < task.jobs.length; job++) {
            if (jobs[job].worker.workerId.toString() === task.bids[bid].worker.workerId.toString()) {
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
            setWorkerOnBidableTask(task, workerBidObj, function (err, task) {
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
                  status = 'taken'
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
        if(taskBid.status !== 'accepted')
          taskBid.status = 'rejected';
        return taskBid;
      });
    }
    var bidIndex = 0;
    for (bidIndex = 0; bidIndex < task.bids.length; bidIndex++)
      if (task.bids[bidIndex].worker.workerId.toString() === workerBidObj.workerId.toString())
        break;
    if (bidIndex === 0) {
      callBack('No bid found.')
    }
    task.bids[bid].status = 'accepted';
    task.jobs.push({
      status: 'active',
      worker: task.bids[bid].worker,
      awardAmount: task.bids[bid].bid
    });
    workerObj.save(function (err, workerObj) {
      if (err)
        callBack(errorHandler.getErrorMessage(err));
      callBack(null, task);
    });
  });
}

function getMongoIndividuals(indIds, callBack) {
  if (indIds.length > 0)
    Individual.find({ '_id': { $in: indIds } }, function(err, inds) {
      if (err)
        callBack(errorHandler.getErrorMessage(err));
      if (inds)
        return callBack(null, inds);
      return callBack(null, []);
    });
  else
    return callBack(null, []);
}

function getMongoEnterprises(entIds, callBack) {
  if (entIds.length > 0)
    Enterprise.find({ '_id': { $in: entIds } }, function(err, ents) {
      if (err)
        callBack(errorHandler.getErrorMessage(err));
      if (ents)
        return callBack(null, ents);
      return callBack(null, []);
    });
  else
    return callBack(null, []);
}


function hashTypeObjId(id) {
  id = id.toString();
  var returnVal = null;
  for (var i = 1; i <= id.length; i++) {
    returnVal += id.codePointAt(i - 1) * i;
  }
  if (returnVal)
    return returnVal.toString(16);
  return null;
}
