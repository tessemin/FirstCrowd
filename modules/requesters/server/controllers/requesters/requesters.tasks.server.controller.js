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
              res.json(tasks);
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
  },
  changeStatus: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        if (typeObj.requester) {
          var newStatus = req.body.status,
            taskId = req.body._id;
          if (newStatus) {
            taskFindOne(taskId, function (err, task) {
              removeTaskFromRequesterArray(taskId, typeObj);
              if (err) {
                // saves the requester because that ID doesn't exist so removes it
                typeObj.save(function (typeErr, typeObj) {
                  if (typeErr)
                    return res.status(404).send({
                      message: errorHandler.getErrorMessage(err) + ' And ' + errorHandler.getErrorMessage(typeErr)
                    });
                  else
                    return res.status(404).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                });
              }
              if (task.requester._id.toString() === typeObj._id.toString()) {
                switch (newStatus) {
                  case 'open':
                    statusPushTo(task, 'open', typeObj.requester.activeTasks);
                    break;
                  case 'inactive':
                    statusPushTo(task, 'inactive', typeObj.requester.suspended);
                    break;
                  case 'taken':
                    statusPushTo(task, 'taken', typeObj.requester.activeTasks);
                    break;
                  case 'suspended':
                    statusPushTo(task, 'suspended', typeObj.requester.suspended);
                    break;
                  case 'sclosed':
                    statusPushTo(task, 'sclosed', typeObj.requester.completedTasks);
                    break;
                  case 'fclosed':
                    statusPushTo(task, 'fclosed', typeObj.requester.rejectedTasks);
                    break;
                  default:
                    return res.status(404).send({
                      message: 'Status not supported.'
                    });
                }
                // save typeObj first to avoid orphaned tasks
                typeObj.save(function (typeErr, typeObj) {
                  if (typeErr) {
                    return res.status(404).send({
                      message: errorHandler.getErrorMessage(typeErr)
                    });
                  } else {
                    task.save(function (err, typeObj) {
                      if (err) {
                        return res.status(404).send({
                          message: errorHandler.getErrorMessage(err)
                        });
                      } else {
                        res.status(200).send({
                          message: 'Status for task ' + task.title + ' updated successfully'
                        });
                      }
                    });
                  }
                });
              } else {
                return res.status(404).send({
                  message: 'You are not the owner of this task'
                });
              }
            });
          }
        } else {
          return res.status(404).send({
            message: 'No requester found.'
          });
        }
      } else {
        return res.status(404).send({
          message: 'You are not signed in as a requester.'
        });
      }
    });
  }
};
// removes that taskId from the requester arrays
function removeTaskFromRequesterArray(taskId, typeObj) {
  if (typeObj.requester) {
    if (typeObj.requester.activeTasks)
      typeObj.requester.activeTasks = removeFromObjectTasksArray(taskId, typeObj.requester.activeTasks);
    if (typeObj.requester.suspendedTasks)
      typeObj.requester.suspendedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.suspendedTasks);
    if (typeObj.requester.completedTasks)
      typeObj.requester.completedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.completedTasks);
    if (typeObj.requester.rejectedTasks)
      typeObj.requester.rejectedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.rejectedTasks);
  }
}

// changes tasks current status and adds task to one of the requester arrays
function statusPushTo(task, taskStatus, requesterArray) {
  task.status = taskStatus;
  if (requesterArray)
    if (requesterArray.length > 0) {
      return (requesterArray.push(task._id));
    } else {
      requesterArray = [];
      return (requesterArray.push(task._id));
    }
  return requesterArray;
}

exports.activeTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        if (typeObj.requester) {
          var taskArray = getAllActiveTaskIds(typeObj);
          taskFindMany(taskArray, function(err, tasks) {
            if (err) {
              return res.status(404).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(tasks);
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

exports.suspendedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        if (typeObj.requester) {
          var taskArray = getAllSuspendedTaskIds(typeObj);
          taskFindMany(taskArray, function(err, tasks) {
            if (err) {
              return res.status(404).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(tasks);
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

exports.completedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        if (typeObj.requester) {
          var taskArray = getAllCompletedTaskIds(typeObj);
          taskFindMany(taskArray, function(err, tasks) {
            if (err) {
              return res.status(404).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(tasks);
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

exports.rejectedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        if (typeObj.requester) {
          var taskArray = getAllRejectedTaskIds(typeObj);
          taskFindMany(taskArray, function(err, tasks) {
            if (err) {
              return res.status(404).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(tasks);
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

exports.workerRating = {
  makeRating: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  delete: function (req, res) {
    
  }
};

function getAllActiveTaskIds(typeObj) {
  var taskArray = [];
  for (var task = 0; task < typeObj.requester.activeTasks; task++) {
    if (typeObj.requester.rejectedTasks[task])
      if (!typeObj.requester.activeTasks[task].hidden && typeObj.requester.activeTasks[task].task) {
        taskArray.push({ _id: typeObj.requester.activeTasks[task].task });
      }
  }
  return taskArray;
}

function getAllSuspendedTaskIds(typeObj) {
  var taskArray = [];
  for (var task = 0; task < typeObj.requester.suspendedTasks; task++) {
    if (typeObj.requester.rejectedTasks[task])
      if (!typeObj.requester.suspendedTasks[task].hidden && typeObj.requester.suspendedTasks[task].task) {
        taskArray.push({ _id: typeObj.requester.suspendedTasks[task].task });
      }
  }
  return taskArray;
}

function getAllCompletedTaskIds(typeObj) {
  var taskArray = [];
  for (var task = 0; task < typeObj.requester.completedTasks; task++) {
    if (typeObj.requester.rejectedTasks[task])
      if (!typeObj.requester.completedTasks[task].hidden && typeObj.requester.completedTasks[task].task) {
        taskArray.push({ _id: typeObj.requester.completedTasks[task].task });
      }
  }
  return taskArray;
}

function getAllRejectedTaskIds(typeObj) {
  var taskArray = [];
  for (var task = 0; task < typeObj.requester.rejectedTasks; task++) {
    if (typeObj.requester.rejectedTasks[task])
      if (!typeObj.requester.rejectedTasks[task].hidden && typeObj.requester.rejectedTasks[task].task) {
        taskArray.push({ _id: typeObj.requester.rejectedTasks[task].task });
      }
  }
  return taskArray;
}

// finds the task in the array and if it matches the taskId, removes it
function removeFromObjectTasksArray (taskId, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].task.toString() === taskId.toString()) {
      array.splice(i, 1);
    }
  }
  return array;
}
