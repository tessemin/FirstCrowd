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
  isRequester = taskTools.isRequester,
  taskId = null,
  taskWhiteListedFields = taskTools.taskWhiteListedFields,
  taskFindOne = taskSearch.taskFindOne,
  taskFindMany = taskSearch.taskFindMany;
  
exports.requesterTasks = {
  all: function (req, res) {
    var tasks = getAllTasksForIds(req, res, function(typeObj) {
      var ids = [].concat(getAllActiveTaskIds(typeObj), getAllRejectedTaskIds(typeObj), getAllCompletedTaskIds(typeObj), getAllSuspendedTaskIds(typeObj))
      console.log(ids)
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
            return res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            callBack(tasks);
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

function getIdsInArray(array) {
  var idArray = [];
  for (var i = 0; i < array.length; i++)
    if (array[i])
      if (array[i].taskId)
        idArray.push(array[i].taskId);
  return idArray;
}
