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
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  _ = require('lodash');

var taskFindOne = taskSearch.taskFindOne,
  taskFindMany = taskSearch.taskFindMany;
var taskWhiteListedFields = ['status'],
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
        typeObj.requester.suspendedTasks = statusPushTo(newTask, typeObj.requester.suspendedTasks);
        typeObj.save(function (typeErr, typeObj) {
          if (typeErr) {
            return res.status(404).send({
              message: 'Error connecting your profile with task: ' + newTask.title
            });
          } else {
            newTask.save(function (err, task) {
              if (err) {
                return res.status(404).send({
                  message: 'Error creating task: ' + task.title
                });
              } else {
                return res.status(200).send({
                  message: 'New task: ' + task.title + ' created successfully'
                });
              }
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
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              return res.status(200).send({
                message: 'Task ' + task.title + ' deleted successfully'
              });
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
            // if we are updating the status, make sure we keep the requester and task in same state
            if (taskWhiteListedFields.indexOf('status') > -1 && req.body.status){
              updateStatus(req.body.status, task._id, typeObj, res, function (typeObj, task) {
                delete req.body.status;
                task = _.extend(task, _.pick(req.body, taskWhiteListedFields));
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
                        return res.status(200).send({
                          message: 'Status for task ' + task.title + ' updated successfully'
                        });
                      }
                    });
                  }
                });
              });
            } else {
              task = _.extend(task, _.pick(req.body, taskWhiteListedFields));
              task.save(function(err) {
                if (err) {
                  return res.status(404).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  return res.status(200).send({
                    message: 'Update successful'
                  });
                }
              });
            }
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
      var workerRatings = {};
      if (task.jobs) {
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
    taskId = req.body._id;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(404).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var requesterRatings = {};
      if (task.jobs) {
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
  changeStatus: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (isRequester(req.user)) {
        if (typeObj.requester) {
          updateStatus(req.body.status, req.body._id, typeObj, res, function (typeObj, task) {
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
                    return res.status(200).send({
                      message: 'Status for task ' + task.title + ' updated successfully'
                    });
                  }
                });
              }
            });
          }); //end update status
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
  if (user.userRole)
    if (user.userRole.indexOf('requester') !== -1) {
      return true;
    }
  return false;
}

function updateStatus(status, taskId, typeObj, res, callBack) {
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
      switch (status) {
        case 'open':
          typeObj.requester.activeTasks = statusPushTo(task, typeObj.requester.activeTasks);
          break;
        case 'inactive':
          typeObj.requester.suspendedTasks = statusPushTo(task, typeObj.requester.suspendedTasks);
          break;
        case 'taken':
          typeObj.requester.activeTasks = statusPushTo(task, typeObj.requester.activeTasks);
          break;
        case 'suspended':
           typeObj.requester.suspendedTasks = statusPushTo(task, typeObj.requester.suspendedTasks);
          break;
        case 'sclosed':
          typeObj.requester.completedTasks = statusPushTo(task, typeObj.requester.completedTasks);
          break;
        case 'fclosed':
          typeObj.requester.rejectedTasks = statusPushTo(task, typeObj.requester.rejectedTasks);
          break;
        default:
          return res.status(404).send({
            message: 'Status not supported.'
          });
      }
      task.status = status;
      // save typeObj first to avoid orphaned tasks
      callBack(typeObj, task);
    } else {
      return res.status(404).send({
        message: 'You are not the owner of this task'
      });
    }
  });
}

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
function statusPushTo(task, requesterArray) {
  if (typeof requesterArray != 'undefined' && requesterArray instanceof Array)
    if (requesterArray.length > 0) {
      if (task._id)
        requesterArray.push({ taskId: task._id });
      return requesterArray;
    }
  requesterArray = [];
  if (task._id)
    requesterArray.push({ taskId: task._id });
  return requesterArray;
}

// finds the task in the array and if it matches the taskId, removes it
function removeFromObjectTasksArray (taskId, array) {
  for (var i = 0; i < array.length; i++)
    if (array[i].task.toString() === taskId.toString())
      array.splice(i, 1);
  return array;
}

exports.getUserTypeObject = getUserTypeObject;

exports.findTaskWorker = findTaskWorker;

exports.taskFindOne = taskFindOne;

exports.taskFindMany = taskFindMany;

exports.taskWhiteListedFields = taskWhiteListedFields;

exports.isRequester = isRequester;
