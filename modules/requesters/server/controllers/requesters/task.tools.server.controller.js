'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  individualControler = require(path.resolve('./modules/individuals/server/controllers/individuals.server.controller')),
  enterpriseControler = require(path.resolve('./modules/enterprises/server/controllers/enterprises.server.controller')),
  _ = require('lodash');

var taskWhiteListedFields = [],
  taskId = null;
/**
 * Requester middleware
 */
exports.requesterByID = function(req, res, next, id) {
  next();
};

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
          newTask.requester.requesterType.enteprise = true;
          newTask.requester._id = typeObj._id;
        } else if (req.user.individual) {
          newTask.requester.requesterType.individual = true;
          newTask.requester._id = typeObj._id;
        } else {
          return res.status(400).send({
            message: 'You do not have that type access'
          });
        }
        newTask.dateCreated = Date.now();
        newTask.save(function(err) {
          if (err) {
            res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.status(200).send({
              message: 'Task ' + newTask.title + ' created successfully!'
            });
          }
        });
      } else {
        return res.status(404).send({
          message: 'You are not a requester'
        });
      }
    });
  },
  delete: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        taskId = req.body._id;
        if (taskId.toString() === typeObj._id.toString()) {
          Task.findByIdAndRemove(taskId, function (err, task) {
            if (err) {
              res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.status(200).send('Task ' + task.title + ' deleted successfully');
            }
          });
        } else {
          return res.status(404).send({
            message: 'You are not the owner of this task'
          });
        }
      } else {
        return res.status(404).send({
          message: 'You are not a requester'
        });
      }
    });
  },
  update: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task.requester._id.toString() === typeObj._id.toString()) {
            task = _.extend(task, _.pick(req.body, taskWhiteListedFields));
            task.save(function(err) {
              if (err) {
                res.status(404).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                res.json(task);
              }
            });
          } else {
            return res.status(404).send({
              message: 'You are not the owner of this task'
            });
          }
        });
      } else {
        return res.status(404).send({
          message: 'You are not a requester'
        });
      }
    });
  },
  getWorkerRatingsForTask: function (req, res) {
    taskId = req.body._id;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(404).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var workerRatings = [];
      if (task.jobs)
        for (var job = 0; job < task.jobs.length; job++) {
          if (task.jobs[job]) {
            if (task.jobs[job].workerRating && task.jobs[job].progress && task.jobs[job].progress >= 100 ) {
              workerRatings.push({
                rating: task.jobs[job].workerRating,
                status: task.jobs[job].status,
                worker: task.jobs[job].worker,
                requester: task.requester
              });
            }
          }
        }
      res.json(workerRatings);
    });
  },
  getRequesterRatingsForTask: function (req, res) {
    taskId = req.body._id;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(404).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var requesterRatings = [];
      if (task.jobs)
        for (var job = 0; job < task.jobs.length; job++) {
          if (task.jobs[job]) {
            if (task.jobs[job].requesterRating && task.jobs[job].progress && task.jobs[job].progress >= 100 ) {
              workerRatings.push({
                rating: task.jobs[job].requesterRating,
                status: task.jobs[job].status,
                worker: task.jobs[job].worker,
                requester: task.requester
              });
            }
          }
        }
      res.json(requesterRatings);
    });
  }
};


function getUserTypeObject(req, res, callBack) {
  if (req.user) {
    if (req.user.individual) {
      individualControler.getThisIndividual(req, res, callBack);
    } else if (req.user.enterprise) {
      enterpriseControler.getThisEnterprise(req, res, callBack);
    } else {
      return res.status(400).send({
        message: 'User has no valid Type'
      });
    }
  } else {
    return res.status(400).send({
      message: 'User is not signed in, please sign in.',
      link: '/',
      linkMessage: 'Navigate Home'
    });
  }
}

function taskFindMany(taskArray, callBack) {
  Task.find({ '_id': { $in: taskArray }, secret: false }, callBack);
}

function taskFindOne(taskId, callBack) {
  Task.find({ '_id': taskId, secret: false }, callBack);
}

function findTaskWorker(task, typeObj, res) {
  var returnTask_Worker = null;
  if (task.workers) {
    for (var i = 0; i < task.workers.length; i++) {
      if (task.workers[i].worker === typeObj._id) {
        returnTask_Worker = task.workers[i].worker;
        break;
      }
    }
    if (!returnTask_Worker) {
      return res.status(400).send({
        message: 'You are not a worker for this task'
      });
    }
  } else {
    return res.status(400).send({
      message: 'You are not a worker for this task'
    });
  }
  return returnTask_Worker;
}

function isRequester(user) {
  if (user.userType.indexOf('requester') !== -1) {
    return true;
  } else {
    return false;
  }
}

exports.getUserTypeObject = getUserTypeObject;

exports.findTaskWorker = findTaskWorker;

exports.taskFindOne = taskFindOne;

exports.taskFindMany = taskFindMany;

exports.taskWhiteListedFields = taskWhiteListedFields;

exports.isRequester = isRequester;
