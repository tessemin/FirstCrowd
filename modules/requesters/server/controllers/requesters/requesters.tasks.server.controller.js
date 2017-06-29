'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  _ = require('lodash');

// functions for task tools  
var getUserTypeObject = taskTools.getUserTypeObject,
  taskFindOne = taskTools.taskFindOne,
  taskFindMany = taskTools.taskFindMany,
  isRequester = taskTools.isRequester,
  taskId = null,
  taskWhiteListedFields = taskTools.taskWhiteListedFields;
  
exports.requesterTasks = {
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        if (typeObj.requester) {
          var taskArray = [];
          taskArray.concat(getAllActiveTaskIds(typeObj));
          taskArray.concat(getAllRejectedTaskIds(typeObj));
          taskArray.concat(getAllCompletedTaskIds(typeObj));
          taskArray.concat(getAllSuspendedTaskIds(typeObj));
          taskFindMany(taskArray, function(err, tasks) {
            if (err) {
              return res.status(404).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json({ tasks: tasks });
            }
          });
        } else {
          return res.status(404).send({
            message: 'No requester found'
          });
        }
      } else {
        return res.status(404).send({
          message: 'You are not a requester'
        });
      }
    });
  }
};

exports.activeTask = {
  all: function (req, res) {
    return res.json(getAllTasksForIds(req, res, getAllActiveTaskIds));
  }
};

exports.suspendedTask = {
  all: function (req, res) {
    return res.json(getAllTasksForIds(req, res, getAllSuspendedTaskIds));
  }
};

exports.completedTask = {
  all: function (req, res) {
    return res.json(getAllTasksForIds(req, res, getAllCompletedTaskIds));
  }
};

exports.rejectedTask = {
  all: function (req, res) {
    return res.json(getAllTasksForIds(req, res, getAllRejectedTaskIds));
  }
};

exports.workerRating = {
  makeRating: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  delete: function (req, res) {
    
  }
};

function getAllTasksForIds(req, res, taskGetFunction) {
   getUserTypeObject(req, res, function(typeObj) {
    if (isRequester(req.user)) {
      if (typeObj.requester) {
        taskFindMany(taskGetFunction(typeObj), function(err, tasks) {
          if (err) {
            return res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            return tasks;
          }
        });
      } else {
        return res.status(404).send({
          message: 'No requester found'
        });
      }
    } else {
      return res.status(404).send({
        message: 'You are not a requester'
      });
    }
  });
}

function getAllActiveTaskIds(typeObj) {
  return getAllTaskIds(typeObj.requester.activeTasks);
}

function getAllSuspendedTaskIds(typeObj) {
  return getAllTaskIds(typeObj.requester.suspendedTasks);
}

function getAllCompletedTaskIds(typeObj) {
  return getAllTaskIds(typeObj.requester.completedTasks);
}

function getAllRejectedTaskIds(typeObj) {
  return getAllTaskIds(typeObj.requester.rejectedTasks);
}

//get all the task ID's from the object provided
function getAllTaskIds(array) {
  var taskIdArray = [];
  for (var task = 0; task < array.length; task++)
    if (array[task])
      if (!array[task].hidden && array[task].task)
        taskIdArray.push(array[task].task);
  return taskIdArray;
}

// finds the task in the array and if it matches the taskId, removes it
function removeFromObjectTasksArray (taskId, array) {
  for (var i = 0; i < array.length; i++)
    if (array[i].task.toString() === taskId.toString())
      array.splice(i, 1);
  return array;
}
