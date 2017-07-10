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
                  message: 'Error creating task: ' + newTask.title
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
                    message: errorHandler.getErrorMessage(err),
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
                message: 'Workers are working on that task\nPlease set status to suspended and resolve any conflicts',
              });
            }
          } else {
            return res.status(422).send({
              message: 'You are not the owner of this task',
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

function setStatus(taskId, status, typeObj, callBack) {
  taskFindOne(taskId, function (err, task) {
    if (err) {
      // TODO: *** should remove from requester task list *** //
      callBack({ error: errorHandler.getErrorMessage(err) });
    }
    setStatusRequester(status, task._id, typeObj, callBack, function (typeObj) {
      setStatusOfWorkers(getWorkersIds(task.jobs), status, task._id, function() {
        task.status = status;
        typeObj.save(function (typeErr, typeObj) {
          if (typeErr) {
            callBack({ error: errorHandler.getErrorMessage(typeErr) });
          } else {
            task.save(function (err, task) {
              if (err) {
                callBack({ error: errorHandler.getErrorMessage(err) });
              } else {
                callBack({ correct: 'Status for task ' + task.title + ' updated successfully' });
              }
            });
          }
        });
      });
    }); 
  });
}


function getUserTypeObject(req, res, callBack) {
  if (req.user) {
    if (req.user.individual) {
      individualControler.getThisIndividual(req, res, callBack);
    } else if (req.user.enterprise) {
      enterpriseControler.getThisEnterprise(req, res, callBack);
    } else {
      return res.status(422).send({
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

function setStatusRequester(status, taskId, typeObj, res, callBack) {
  typeObj = removeTaskFromRequesterArray(taskId, typeObj);
  switch (status) {
    case 'open':
      typeObj.requester.activeTasks = statusPushTo(taskId, typeObj.requester.activeTasks);
      break;
    case 'inactive':
      typeObj.requester.suspendedTasks = statusPushTo(taskId, typeObj.requester.suspendedTasks);
      break;
    case 'taken':
      typeObj.requester.activeTasks = statusPushTo(taskId, typeObj.requester.activeTasks);
      break;
    case 'suspended':
      typeObj.requester.suspendedTasks = statusPushTo(taskId, typeObj.requester.suspendedTasks);
      break;
    case 'sclosed':
      typeObj.requester.completedTasks = statusPushTo(taskId, typeObj.requester.completedTasks);
      break;
    case 'fclosed':
      typeObj.requester.rejectedTasks = statusPushTo(taskId, typeObj.requester.rejectedTasks);
      break;
    default:
      return res({ error: 'Status not supported.' });
  }
  // save typeObj first to avoid orphaned tasks
  callBack(typeObj);
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
  return typeObj;
}

// removes that taskId from the worker arrays
function removeTaskFromWorkerArray(taskId, typeObj) {
  if (typeObj.worker) {
    if (typeObj.requester.activeTasks)
      typeObj.requester.activeTasks = removeFromObjectTasksArray(taskId, typeObj.requester.activeTasks);
    if (typeObj.requester.inactiveTasks)
      typeObj.requester.inactiveTasks = removeFromObjectTasksArray(taskId, typeObj.requester.inactiveTasks);
    if (typeObj.requester.completedTasks)
      typeObj.requester.completedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.completedTasks);
    if (typeObj.requester.rejectedTasks)
      typeObj.requester.rejectedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.rejectedTasks);
    if (typeObj.requester.recomendedTasks)
      typeObj.requester.recomendedTasks = removeFromObjectTasksArray(taskId, typeObj.requester.recomendedTasks);
  }
  return typeObj;
}

// changes tasks current status and adds task to one of the requester arrays
function statusPushTo(taskId, array) {
  if (typeof array != 'undefined' && array instanceof Array)
    if (array.length > 0 && taskId) {
      if (taskId)
        array.push({ taskId: taskId });
      return array;
    }
  array = [];
  if (taskId)
    array.push({ taskId: taskId });
  return array;
}

// finds the task in the array and if it matches the taskId, removes it
function removeFromObjectTasksArray (taskId, array) {
  for (var i = 0; i < array.length; i++)
    if (array[i].task.toString() === taskId.toString())
      array.splice(i, 1);
  return array;
}

function ownsTask(task, typeObj) {
  return task.requester.requesterId.toString() === typeObj._id.toString();
}

function getIdsInArray(array) {
  var idArray = [];
  for (var i = 0; i < array.length; i++)
    if (array[i])
      if (array[i].taskId)
        idArray.push(array[i].taskId);
  return idArray;
}

function getWorkersIds(jobs) {
  var workersEnterprise = [];
  var workersIndividual = [];
  for (var job = 0; job < jobs.length; job++) {
    if (jobs[job].worker) {
      if (jobs[job].worker.workerId)
        if (jobs[job].worker.workerType) {
          if (jobs[job].worker.workerType.enterprise) {
            workersEnterprise.push(jobs[job].worker.workerId);
          } else if (jobs[job].worker.workerType.individual) {
            workersIndividual.push(jobs[job].worker.workerId);
          } else {
            workersEnterprise.push(jobs[job].worker.workerId);
            workersIndividual.push(jobs[job].worker.workerId);
          }
        } else {
          workersEnterprise.push(jobs[job].worker.workerId);
          workersIndividual.push(jobs[job].worker.workerId);
        }
    }
  }
  return { enterpriseIds: workersEnterprise, individualIds: workersIndividual };
}

function setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId) {
  if (!errorIds)
    errorIds = [];
  workerId = null;
  if (workerIdArray.enterpriseIds) {
    workerId = workerIdArray.enterpriseIds.shift();
    if (workerIdArray.enterpriseIds.length <= 0)
      delete workerIdArray.enterpriseIds;
    Enterprise.find({ '_id': workerId }, function(err, enterprise) {
      if (err) {
        errorIds.push({ error: err, workerId: workerId });
        return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
      } else {
        if (enterprise.legnth <= 0)
          return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
        enterprise = enterprise[0];
        enterprise = removeTaskFromWorkerArray(taskId, enterprise);
        enterprise = addWorkerTaskWithStatus(status, taskId, enterprise);
        enterprise.save(function(err, enterprise) {
          if (err)
            errorIds.push({ error: err, workerId: workerId });
          return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
        });
      }
    });
  } else if (workerIdArray.individualIds) {
    workerId = workerIdArray.individualIds.shift();
    if (workerIdArray.individualIds.length <= 0)
      delete workerIdArray.individualIds;
    Individual.find({ '_id': workerId }, function(err, individual) {
      if (err) {
        errorIds.push({ error: err, workerId: workerId });
        return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
      } else {
        if (individual.legnth <= 0)
          return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
        individual = individual[0];
        individual = removeTaskFromWorkerArray(taskId, individual);
        individual = addWorkerTaskWithStatus(status, taskId, individual);
        individual.save(function(err, individual) {
          if (err)
            errorIds.push({ error: err, workerId: workerId });
          return setStatusOfWorkers(workerIdArray, status, taskId, callBack, errorIds, workerId);
        });
      }
    });
  } else {
    callBack(errorIds);
  }
}

// MUST MODIFY
function addWorkerTaskWithStatus(status, taskId, typeObj) {
  switch (status) {
    case 'open':
      typeObj.worker.activeTasks = statusPushTo(taskId, typeObj.worker.activeTasks);
      break;
    case 'inactive':
      typeObj.worker.inactiveTasks = statusPushTo(taskId, typeObj.worker.inactiveTasks);
      break;
    case 'taken':
      typeObj.worker.activeTasks = statusPushTo(taskId, typeObj.worker.activeTasks);
      break;
    case 'suspended':
      typeObj.worker.inactiveTasks = statusPushTo(taskId, typeObj.worker.inactiveTasks);
      break;
    case 'sclosed':
      typeObj.worker.completedTasks = statusPushTo(taskId, typeObj.worker.completedTasks);
      break;
    case 'fclosed':
      typeObj.worker.rejectedTasks = statusPushTo(taskId, typeObj.worker.rejectedTasks);
      break;
  }
  return typeObj;
}

function isRequester(user) {
  if (user.userRole)
    if (user.userRole.indexOf('requester') > -1)
      return true;
  return false;
}

function isWorker(user) {
  if (user.userRole)
    if (user.userRole.indexOf('worker') > -1)
      return true;
  return false;
}

exports.getUserTypeObject = getUserTypeObject;

exports.taskWhiteListedFields = taskWhiteListedFields;

exports.ownsTask = ownsTask;

exports.getIdsInArray = getIdsInArray;

exports.isRequester = isRequester;

exports.isWorker = isWorker;

exports.removeTaskFromWorkerArray = removeTaskFromWorkerArray;

exports.setStatus = setStatus;
