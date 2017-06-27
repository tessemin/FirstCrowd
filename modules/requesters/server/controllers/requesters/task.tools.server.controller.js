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


/**
 * Requester middleware
 */
exports.requesterByID = function(req, res, next, id) {

  /* if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Requester is invalid'
    });
  }

  Requester.findById(id).populate('user', 'displayName').exec(function (err, requester) {
    if (err) {
      return next(err);
    } else if (!requester) {
      return res.status(404).send({
        message: 'No Requester with that identifier has been found'
      });
    }
    req.requester = requester;
    next();
  }); */
  next();
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
      message: 'User is not signed in'
    });
  }
}

function taskFindMany(taskArray, callBack) {
  Task.find({ '_id': { $in: taskArray }, secret: false}, callBack);
}

function taskFindOne(taskId, callBack) {
  Task.find({ '_id': taskId, secret: false }, callBack);
}

function findTaskWorker(task, typeObj, res) {
  if (task.workers) {
    var returnTask_Worker = null;
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

exports.getUserTypeObject = getUserTypeObject;

exports.findTaskWorker = findTaskWorker;

exports.taskFindOne = taskFindOne;

exports.taskFindMany = taskFindMany;
