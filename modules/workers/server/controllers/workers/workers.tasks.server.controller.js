'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  workerFile = require(path.resolve('./modules/workers/server/controllers/workers/workers.file.server.controller')),
  _ = require('lodash'),
  fs = require('fs');

var jobWhitelistedFields = ['progress'],
  taskId = null,
  // functions for task tools
  getUserTypeObject = taskTools.getUserTypeObject,
  getIdsInArray = taskTools.getIdsInArray,
  updateTotalTaskProgress = taskTools.updateTotalTaskProgress,
  addWorkerTaskWithStatus = taskTools.addWorkerTaskWithStatus,
  removeTaskFromWorkerArray = taskTools.removeTaskFromWorkerArray,
  hashObjId = taskTools.hashObjId,
  taskFindOne = taskSearch.taskFindOne,
  taskFindMany = taskSearch.taskFindMany,
  taskFindWithOption = taskSearch.taskFindWithOption,
  findTaskWorker = taskSearch.findTaskWorker,
  findJobByWorker = taskSearch.findJobByWorker,
  sendWorkerMessage = workerFile.sendWorkerMessage;


/*
 * Active Tasks
 */
// opperations on task ID
exports.activeTask = {
  // update a single active task
  update: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body.taskId;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          var taskJob = findJobByWorker(task, typeObj);
          if (!taskJob) {
            return res.status(422).send({
              message: 'You are not a worker for this task'
            });
          }
          if (taskJob.status !== 'active') {
            return res.status(422).send({
              message: 'You are not an active worker for this task.'
            });
          }
          taskJob = _.extend(taskJob, _.pick(req.body, jobWhitelistedFields));
          taskJob.save(function(err) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              updateTotalTaskProgress(task, function(response) {
                if (!response)
                  return res.status(422).send({
                    message: 'Error seting total progress'
                  });
                else if (response.error)
                  return res.status(422).send({
                    message: response.error
                  });
                else
                  return res.status(200).send({
                    message: 'Updated successfully!'
                  });
              });
            }
          });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  },
  // get all active tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        
        taskFindMany(getIdsInArray(typeObj.worker.activeTasks), true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (tasks)
            tasks = removeExtraWorkers(tasks, typeObj._id);
          return res.json({ tasks: tasks });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  },
  quitTask: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskId = req.body.taskId;
      taskFindOne(taskId, function(err, task) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        var taskJob = findJobByWorker(task, typeObj);
        if (!taskJob) {
          return res.status(422).send({
            message: 'You are not a worker for this task'
          });
        }
        if (taskJob.status === 'submitted') {
          return res.status(422).send({
            message: 'Your task is marked complete, please wait for the task owner to approve your work.'
          });
        }
        if (taskJob.status !== 'active') {
          return res.status(422).send({
            message: 'You are not an active worker for this task.'
          });
        }
        if (!(task.status === 'open' || task.status === 'taken' || task.status === 'suspended')) {
          return res.status(422).send({
            message: 'Task is in a final state, no need to quit.'
          });
        }
        task.jobs[task.jobs.indexOf(taskJob)].status = 'quit';
        task.multiplicity++;
        if (task.status === 'taken') {
          task.status = 'open';
        }
        typeObj = removeTaskFromWorkerArray(task._id, typeObj)
        typeObj = addWorkerTaskWithStatus('fclosed', task._id, typeObj)
        typeObj.save(function(err) {
          if (err)
            return res.status(422).send({ message: errorHandler.getErrorMessage(err) });
          task.save(function(err, task) {
            if (err)
              return res.status(422).send({ message: errorHandler.getErrorMessage(err) });
            sendWorkerMessage('Worker: ' + hashObjId(typeObj._id) + ' has quit this task.', task._id, typeObj._id, null, function (err, message) {
              if (err)
                return res.status(422).send({
                  message: 'You have quit the task, but no message was sent.'
                });
              return res.status(200).send({
                message: 'You have quit task: ' + task.title,
                task: task
              });
            });
          });
        });
      });
    });
  }
};

/*
 * Rejected Tasks
 */
// opperations on task ID
exports.rejectedTask = {
  // get all rejected tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(getIdsInArray(typeObj.worker.rejectedTasks), true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (tasks)
            tasks = removeExtraWorkers(tasks, typeObj._id);
          return res.json({ tasks: tasks });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  }
};

/*
 * Completed Tasks
 */
// opperations on task ID
exports.completedTask = {
  // get all completed tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(getIdsInArray(typeObj.worker.completedTasks), true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (tasks)
            tasks = removeExtraWorkers(tasks, typeObj._id);
          return res.json({ tasks: tasks });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  }
};

/*
 * Inactive Tasks
 */
// opperations on task ID
exports.inactiveTask = {
  // get all inactive tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(getIdsInArray(typeObj.worker.inactiveTasks), true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (tasks)
            tasks = removeExtraWorkers(tasks, typeObj._id);
          return res.json({ tasks: tasks });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  }
};

/*
 * recomended Tasks
 */
// opperations on task ID
exports.recomendedTask = {
  // get all recomended tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(getIdsInArray(typeObj.worker.recomendedTasks), true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (tasks)
            tasks = removeExtraWorkers(tasks, typeObj._id);
          return res.json({ tasks: tasks });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  }
};

exports.taskByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Task is invalid'
    });
  }

  Task.findById(id).populate('user', 'displayName').exec(function (err, task) {
    if (err) {
      return next(err);
    } else if (!task) {
      return res.status(422).send({
        message: 'No Task with that identifier has been found'
      });
    }
    req.task = task;
    next();
  });
};

exports.getAllOpenTasks = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    taskFindWithOption({ status: 'open', secret: false },
      [{ 'jobs': { $not: { $elemMatch: { 'worker.workerId': typeObj._id } } } },
      { 'requester.requesterId': { $ne: typeObj._id } }],
      function (err, tasks) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        if (tasks)
          tasks = removeExtraWorkers(tasks, typeObj._id);
        return res.json({ tasks: tasks });
      });
  });
};

exports.getOneTask = function(req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    taskId = req.body.taskId;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (task)
        task = removeExtraWorkers(task, typeObj._id);
      return res.json({ task: task });
    });
  });
};

exports.getWorkerForTask = function(req, res) {
  taskId = req.body.taskId;
  getUserTypeObject(req, res, function(typeObj) {
    taskFindOne(taskId, function(err, task) {
      var isWorker = findTaskWorker(task, typeObj, res);
      if (isWorker)
        return res.json({ worker: isWorker });
      else
        return res.status(422).send({
          message: 'You are not a worker for this task'
        });
    });
  });
};

exports.getTasksWithOptions = function(req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    req.body.secret = false;
    taskFindWithOption(req.body,
      [{ 'jobs': { $not: { $elemMatch: { 'worker.workerId': typeObj._id } } } },
      { 'requester.requesterId': { $ne: typeObj._id } }],
      function (err, tasks) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        if (tasks)
          tasks = removeExtraWorkers(tasks, typeObj._id);
        return res.json({ tasks: tasks });
      });
  });
};

function removeExtraWorkers(task, workerId) {
  if (task) {
    if (Array.isArray(task)) { // multiple tasks
      task = task.map(function(task) {
        return removeExtraWorkers(task, workerId);
      });
    } else { // single task
      var stringWorkerId = workerId.toString();
      if (task.jobs)
        for (var job = 0; job < task.jobs.length; job++)
          if (task.jobs[job].worker.workerId.toString() === stringWorkerId) {
            task.jobs = [task.jobs[job]];
            break;
          }
      if (task.payment && task.payment.bidding && task.payment.bidding.bidable && task.bids && task.bids.length > 0) {
        for (var bid = 0; bid < task.bids.length; bid++) {
          if (task.bids[bid].worker.workerId.toString() === stringWorkerId) {
            task.bids = [task.bids[bid]];
            break;
          }
        }
      }
    }
  }
  return task;
}
