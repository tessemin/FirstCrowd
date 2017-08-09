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
  _ = require('lodash');

// imported functions
var getUserTypeObject = taskTools.getUserTypeObject,
  isRequester = taskTools.isRequester,
  ownsTask = taskTools.ownsTask,
  statusPushTo = taskTools.statusPushTo,
  getNestedProperties = taskTools.getNestedProperties,
  hashObjId = taskTools.hashObjId,
  taskFindOne = taskSearch.taskFindOne;

var individualWhiteListFields = ['_id', 'schools', 'jobExperience', 'certification', 'tools', 'specialities', 'skills', 'worker.requesterRatingsPerCategory', 'worker.acceptanceRatesPerCategory', 'worker.acceptanceRate', 'worker.averageCompletionTime', 'worker.preferedCategories'],
  enterpriseWhiteListFields = ['_id', 'profile.companyName', 'profile.yearEstablished', 'profile.classifications', 'profile.description', 'specialities', 'catalog', 'worker.requesterRatingsPerCategory', 'worker.acceptanceRatesPerCategory', 'worker.acceptanceRate', 'worker.averageCompletionTime', 'worker.preferedCategories'];

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
                  message: errorHandler.getErrorMessage(err)
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
  }
};

exports.biddingActions = {
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
                ind.displayId = hashObjId(ind._id);
                return ind;
              });
              var safeEnts = enterprises.map(function(ent) {
                ent = getNestedProperties(ent, enterpriseWhiteListFields);
                ent.displayId = hashObjId(ent._id);
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
