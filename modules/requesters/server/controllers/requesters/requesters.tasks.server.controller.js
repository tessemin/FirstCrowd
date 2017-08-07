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
  requesterFiles = require(path.resolve('./modules/requesters/server/controllers/requesters/requester.tasks.file.server.controller')),
  _ = require('lodash');

// functions for task tools  
var getUserTypeObject = taskTools.getUserTypeObject,
  taskWhiteListedFields = taskTools.taskWhiteListedFields,
  ownsTask = taskTools.ownsTask,
  getIdsInArray = taskTools.getIdsInArray,
  isRequester = taskTools.isRequester,
  addWorkerTaskWithStatus = taskTools.addWorkerTaskWithStatus,
  removeTaskFromWorkerArray = taskTools.removeTaskFromWorkerArray,
  statusPushTo = taskTools.statusPushTo,
  getNestedProperties = taskTools.getNestedProperties,
  hashObjId = taskTools.hashObjId,
  updateTotalTaskProgress = taskTools.updateTotalTaskProgress,
  setStatusRequester = taskTools.setStatusRequester,
  taskFindOne = taskSearch.taskFindOne,
  taskFindMany = taskSearch.taskFindMany,
  findWorkerByWorkerTaskObject = taskSearch.findWorkerByWorkerTaskObject,
  findJobByWorker = taskSearch.findJobByWorker,
  setUpRequesterFileExchange = requesterFiles.setUpRequesterFileExchange,
  sendRequesterMessage = requesterFiles.sendRequesterMessage;
  
var taskId = null;
  
exports.requesterTasks = {
  all: function (req, res) {
    getAllRequesterTasks(req, res, function (tasks) {
      return res.json({ tasks: tasks });
    });
  }
};

function getAllRequesterTasks(req, res, callBack) {
  var tasks = getAllTasksForIds(req, res, function(typeObj) {
    var ids = [].concat(getAllActiveTaskIds(typeObj), getAllRejectedTaskIds(typeObj), getAllCompletedTaskIds(typeObj), getAllSuspendedTaskIds(typeObj));
    return ids;
  }, function(tasks) {
    callBack(tasks);
  });
}

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

// a non-safe function for outside use
// will return secret tasks
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
            tasks = mapTaskJobToDisplay(tasks);
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

function mapTaskJobToDisplay(tasks) {
  return tasks.map(function(task) {
    task = JSON.parse(JSON.stringify(task));
    task.jobs = task.jobs.map(function(job) {
      if (job.worker)
        job.worker.displayId = hashObjId(job.worker.workerId);
      return job;
    });
    return task;
  });
}

function setTaskStatus(requester, task, callBack) {
  var successes = 0;
  var jobsAllDone = true;
  for(var job = 0; job < task.jobs.length; job++) {
    if (task.jobs[job].status === 'accepted')
      successes++
    if (task.jobs[job].status === 'active' || task.jobs[job].status === 'submitted') {
      jobsAllDone = false;
    }
  };
  if (!jobsAllDone)
    callBack(null)
  if (successes >= task.successFactor)
    task.status = 'sclosed';
  else
    task.status = 'fclosed';
  
  setStatusRequester(task.status, task._id, requester, function(requester) {
    task.save(function(err, task) {
      if (err) return callBack(errorHandler.getErrorMessage(err));
      requester.save(function(err) {
        if (err) return callBack(errorHandler.getErrorMessage(err));
        return callBack(null, task);
      })
    });
  });
  
}

exports.submission = {
  reject: function (req, res) {
    setUpRequesterFileExchange(req, res, function(typeObj, task) {
      var jobIndex = task.jobs.indexOf(findJobByWorker(task, { _id: req.body.workerId }));
      if (task.jobs[jobIndex].status === 'rejected' || task.jobs[jobIndex].status === 'accepted')
        return res.status(422).send({ message: 'That worker is in a final state.' });
      if (task.jobs[jobIndex].status === 'active')
        return res.status(422).send({ message: 'That worker is still working.' }); 
      findWorkerByWorkerTaskObject(task.jobs[jobIndex].worker, function(err, worker) {
        if (err) {
          return res.status(422).send({
            message: err
          }); 
        }
        worker = removeTaskFromWorkerArray(task._id, worker);
        worker = addWorkerTaskWithStatus('fclosed', task._id, worker);
        task.jobs[jobIndex].status = 'rejected';
        
        worker.save(function(err) {
          if (err)
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            }); 
          setTaskStatus(typeObj, task, function(err, task) {
            if (err)
              return res.status(422).send({
                message: err
              });
            if (req.body.message && req.body.message.length > 0)
              req.body.message = 'Task Submission Rejected: ' + req.body.message;
            sendRequesterMessage(req.body.message, task._id, req.body.workerId, null, function(err) {
              if (err)
                return res.status(200).send({
                  message: 'Submission rejected, but the message was not sent.'
                });
              return res.status(200).send({
                message: 'Submission Rejected.',
                task: task
              }); 
            });
          });
        });
      });
    });
  },
  approve: function (req, res) {
    setUpRequesterFileExchange(req, res, function(typeObj, task) {
      var jobIndex = task.jobs.indexOf(findJobByWorker(task, { _id: req.body.workerId }));
      if (task.jobs[jobIndex].status === 'rejected' || task.jobs[jobIndex].status === 'accepted')
        return res.status(422).send({ message: 'That worker is in a final state.' });
      if (task.jobs[jobIndex].status === 'active')
        return res.status(422).send({ message: 'That worker is still working.' }); 
      findWorkerByWorkerTaskObject(task.jobs[jobIndex].worker, function(err, worker) {
        if (err) {
          return res.status(422).send({
            message: err
          }); 
        }
        worker = removeTaskFromWorkerArray(task._id, worker);
        worker = addWorkerTaskWithStatus('sclosed', task._id, worker);
        task.jobs[jobIndex].status = 'accepted';
        worker.save(function(err) {
          if (err)
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            }); 
          setTaskStatus(typeObj, task, function(err, task) {
            if (err)
              return res.status(422).send({
                message: err
              }); 
            if (req.body.message && req.body.message.length > 0)
              req.body.message = 'Task Submission Accepted: ' + req.body.message;
            sendRequesterMessage(req.body.message, task._id, req.body.workerId, null, function(err) {
              if (err)
                return res.status(200).send({
                  message: 'Submission approved, but the message was not sent.'
                });
              return res.status(200).send({
                message: 'Submission Approved!',
                task: task
              }); 
            });
          });
        });
      });
    });
  },
  retry: function (req, res) {
    setUpRequesterFileExchange(req, res, function(typeObj, task) {
      var jobIndex = task.jobs.indexOf(findJobByWorker(task, { _id: req.body.workerId }));
      if (task.jobs[jobIndex].status === 'rejected' || task.jobs[jobIndex].status === 'accepted')
        return res.status(422).send({ message: 'That worker is in a final state.' }); 
      if (task.jobs[jobIndex].status === 'active')
        return res.status(422).send({ message: 'That worker is still working.' }); 
      task.jobs[jobIndex].status = 'active';
      task.save(function(err, task) {
        if (err)
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        if (req.body.message && req.body.message.length > 0)
          req.body.message = 'Task Owner Approved Retry: ' + req.body.message;
        sendRequesterMessage(req.body.message, task._id, req.body.workerId, null, function(err) {
          if (err)
            return res.status(200).send({
              message: 'Retry approved, but the message was not sent.'
            });
          return res.status(200).send({
            message: 'Retry approved!',
            task: task
          }); 
        });
      });
    });
  }
};

exports.getAllRequesterTasks = getAllRequesterTasks;
