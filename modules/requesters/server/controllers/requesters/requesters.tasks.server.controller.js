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
  taskTools = require(path.resolve('./modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  _ = require('lodash');

// functions for task tools  
var getUserTypeObject = taskTools.getUserTypeObject,
  taskId = null,
  taskWhiteListedFields = taskTools.taskWhiteListedFields,
  ownsTask = taskTools.ownsTask,
  getIdsInArray = taskTools.getIdsInArray,
  isRequester = taskTools.isRequester,
  setStatus = taskTools.setStatus,
  removeTaskFromWorkerArray = taskTools.removeTaskFromWorkerArray,
  statusPushTo = taskTools.statusPushTo,
  getNestedProperties = taskTools.getNestedProperties,
  taskFindOne = taskSearch.taskFindOne,
  taskFindMany = taskSearch.taskFindMany,
  findWorkerByWorkerTaskObject = taskSearch.findWorkerByWorkerTaskObject;
  
var individualWhiteListFields = ['_id', 'schools', 'jobExperience', 'certification', 'tools', 'specialities', 'skills', 'worker.requesterRatingsPerCategory', 'worker.acceptanceRatesPerCategory', 'worker.acceptanceRate', 'worker.averageCompletionTime', 'worker.preferedCategories'],
  enterpriseWhiteListFields = ['_id', 'profile.companyName', 'profile.yearEstablished', 'profile.classifications', 'profile.description', 'specialities', 'catalog', 'worker.requesterRatingsPerCategory', 'worker.acceptanceRatesPerCategory', 'worker.acceptanceRate', 'worker.averageCompletionTime', 'worker.preferedCategories'];
  
exports.requesterTasks = {
  all: function (req, res) {
    var tasks = getAllTasksForIds(req, res, function(typeObj) {
      var ids = [].concat(getAllActiveTaskIds(typeObj), getAllRejectedTaskIds(typeObj), getAllCompletedTaskIds(typeObj), getAllSuspendedTaskIds(typeObj));
      return ids;
    }, function(tasks) {
      return res.json({ tasks: tasks });
    });
  }
};

exports.activeTask = {
  all: function (req, res) {
    var tasks = getAllTasksForIds(req, res, getAllActiveTaskIds, function(tasks) {
      return res.json({ tasks: tasks });
    });
  }
};

exports.suspendedTask = {
  all: function (req, res) {
    var tasks = getAllTasksForIds(req, res, getAllSuspendedTaskIds, function(tasks) {
      return res.json({ tasks: tasks });
    });
  }
};

exports.completedTask = {
  all: function (req, res) {
    var tasks = getAllTasksForIds(req, res, getAllCompletedTaskIds, function(tasks) {
      return res.json({ tasks: tasks });
    });
  }
};

exports.rejectedTask = {
  all: function (req, res) {
    var tasks = getAllTasksForIds(req, res, getAllRejectedTaskIds, function(tasks) {
      return res.json({ tasks: tasks });
    });
  }
};

exports.workerRating = {
  makeRating: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        taskFindOne(taskId, function(err, task) {
          if (ownsTask(task, typeObj)) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            }
            for (var worker = 0; worker < task.jobs.length; worker++) {
              if (task.jobs[worker].workerId.toString() === req.body.worker.workerId.toString()) {
                task.jobs[worker].ratingOnWorker = req.body.rating;
                break;
              }
            }
            task.save(function(err, task) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                return res.status(200).send({
                  message: 'Rating for worker succeeded'
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
    });
  },
  all: function (req, res) {
    
  },
  delete: function (req, res) {
    
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
  acceptBid: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function (err, task) {
        if (ownsTask(task, typeObj)) {
          var bidId = req.body.bidId,
            foundBid = false,
            bid = 0;
          for (bid = 0; bid < task.bids.length && bidId; bid++) {
            if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
              foundBid = true;
              break;
            }
          }
          if (foundBid) {
            findWorkerByWorkerTaskObject(task.bids[bid].worker, function (err, workerObj) {
              if (err)
                return res.status(422).send({
                  message: err
                });
              workerObj = removeTaskFromWorkerArray(task._id, workerObj);
              workerObj.worker.activeTasks = statusPushTo(task._id, workerObj.worker.activeTasks);
              --task.multiplicity;
              task.bids[bid].status = 'accepted';
              task.jobs.push({
                status: 'active',
                worker: task.bids[bid].worker,
                awardAmount: task.bids[bid].bid
              });
              workerObj.save(function (err, workerObj) {
                if (err)
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                task.save(function (err, task) {
                  if (err)
                    return res.status(422).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  return res.status(200).send({
                    message: 'Bid accepted!'
                  });
                });
              });
            });
          }
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
  rejectBid: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function (err, task) {
        if (ownsTask(task, typeObj)) {
          var bidId = req.body.bidId;
          for (var bid = 0; bid < task.bids.length && bidId; bid++) {
            if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
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
  }
};

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

function getAllTasksForIds(req, res, taskIdGetFunction, callBack) {
  getUserTypeObject(req, res, function(typeObj) {
    if (isRequester(req.user)) {
      if (typeObj.requester) {
        taskFindMany(taskIdGetFunction(typeObj), true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            callBack(tasks);
          }
        });
      } else {
        return res.status(422).send({
          message: 'No requester found'
        });
      }
    } else {
      return res.status(422).send({
        message: 'You are not a requester'
      });
    }
  });
}

function getAllActiveTaskIds(typeObj) {
  return getIdsInArray(typeObj.requester.activeTasks);
}

function getAllSuspendedTaskIds(typeObj) {
  return getIdsInArray(typeObj.requester.suspendedTasks);
}

function getAllCompletedTaskIds(typeObj) {
  return getIdsInArray(typeObj.requester.completedTasks);
}

function getAllRejectedTaskIds(typeObj) {
  return getIdsInArray(typeObj.requester.rejectedTasks);
}

