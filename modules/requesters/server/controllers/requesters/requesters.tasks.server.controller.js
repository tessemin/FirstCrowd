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
  taskId = null,
  taskWhiteListedFields = [];
  
exports.requesterTasks = {
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (req.user.userType.indexOf('requester') !== -1) {
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
      if (req.user.userType.indexOf('requester') !== -1) {
        if (typeObj.requester) {
          var newStatus = req.body.status,
            taskId = req.body._id;
          if (newStatus) {
            taskFindOne(taskId, function (err, task) {
              removeTaskFromRequesterArray(taskId, typeObj);
              if (err) {
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
              if (typeObj.requester) {
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
                task.save(function (err, task) {
                  if (err) {
                    return res.status(404).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    typeObj.save(function (typeErr, typeObj) {
                      if (typeErr) {
                        return res.status(404).send({
                          message: errorHandler.getErrorMessage(typeErr)
                        });
                      } else {
                        res.json(typeObj);
                      }
                    });
                  }
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
      if (req.user.userType.indexOf('requester') !== -1) {
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
  },
  add: function (req, res) {
    
  }
};

exports.suspendedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (req.user.userType.indexOf('requester') !== -1) {
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
  },
  add: function (req, res) {
    
  }
};

exports.completedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (req.user.userType.indexOf('requester') !== -1) {
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
  },
  add: function (req, res) {
    
  }
};

exports.rejectedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (req.user.userType.indexOf('requester') !== -1) {
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
  },
  add: function (req, res) {
    
  }
};

exports.workerRating = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  create: function (req, res) {
    
  }
};

exports.taskActions = {
  create: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      // user is signed in a requester
      if (req.user.userRole.indexOf('requester') !== -1) {
        if (req.body.skillsNeeded) {
          req.body.skillsNeeded = req.body.skillsNeeded.split(',')
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
            res.status(400).send(err);
          } else {
            res.json(newTask);
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
      if (req.user.userRole.indexOf('requester') !== -1) {
        taskId = req.body._id;
        if (taskId.toString() === typeObj._id.toString()) {
          Task.findByIdAndRemove(taskId, function (err, task) {
            if (err) {
              res.status(400).send(err);
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
      if (req.user.userRole.indexOf('requester') !== -1) {
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
                res.status(400).send(err);
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

function removeFromObjectTasksArray (taskId, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].task.toString() === taskId.toString()) {
      array.splice(i, 1);
    }
  }
  return array;
}
