'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
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
  taskFindOne = taskSearch.taskFindOne,
  taskFindMany = taskSearch.taskFindMany;
  
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

