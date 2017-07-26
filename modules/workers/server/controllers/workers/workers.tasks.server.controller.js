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
  _ = require('lodash'),
  fs = require('fs');

var jobWhitelistedFields = ['progress'],
  taskId = null,
  // functions for task tools
  getUserTypeObject = taskTools.getUserTypeObject,
  getIdsInArray = taskTools.getIdsInArray,
  updateTotalTaskProgress = taskTools.updateTotalTaskProgress,
  taskFindOne = taskSearch.taskFindOne,
  taskFindMany = taskSearch.taskFindMany,
  taskFindWithOption = taskSearch.taskFindWithOption,
  findTaskWorker = taskSearch.findTaskWorker,
  findJobByWorker = taskSearch.findJobByWorker;


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
        
        taskFindMany(getIdsInArray(typeObj.worker.activeTasks), false, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (tasks)
            tasks = removeExtraWorkers(tasks, typeObj._id);
          res.json({ tasks: tasks });
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
 * Rejected Tasks
 */
// opperations on task ID
exports.rejectedTask = {
  // get all rejected tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(getIdsInArray(typeObj.worker.rejectedTasks), function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (tasks)
            tasks = removeExtraWorkers(tasks, typeObj._id);
          res.json({ tasks: tasks });
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
        taskFindMany(getIdsInArray(typeObj.worker.completedTasks), false, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (tasks)
            tasks = removeExtraWorkers(tasks, typeObj._id);
          res.json({ tasks: tasks });
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
        taskFindMany(getIdsInArray(typeObj.worker.inactiveTasks), false, function(err, tasks) {
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
          tasks = removeExtraWorkers(tasks, 'This is not an ID');
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

function writeFilesToPath(file, path, callBack, next) {
  console.log(file)
  fs.readFile(file.path, function (err, data) {
    if (err) {
      console.log(err)
      return callBack(err);
    }
    // set the correct path for the file not the temporary one from the API:
    file.name = file.name.replace(/ /g, '_');
    file.path = path + file.name;

    // copy the data from the req.files.file.path and paste it to file.path
    fs.mkdir(file.path, function (err) {
      fs.writeFile(file.path, data, function (err) {
        if (err) {
          console.log(err)
          return callBack(err);
        }
        console.log('\n');
        console.log(file.name);
        console.log('\n');
        if (next)
          return next(path, callBack, next);
        else
          return callBack();
      });
    });
  });
}

// for file upload
exports.prototype = {
  submitToTask: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskId = req.body.taskId;
      taskFindOne(taskId, function(err, task) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        if (!task) {
          return res.status(422).send({
            message: 'No task with that Id found.'
          });
        }
        var jobIndex = 0,
          jobFound = false;
        while (jobIndex < task.jobs.length && !jobFound) {
          if (task.jobs[jobIndex].worker.workerId.toString() === typeObj._id.toString())
            jobFound = true;
          jobIndex++;
        }
        if (!jobFound) {
          return res.status(422).send({
            message: 'You are not a worker for this task.'
          });
        }
        if (!(task.jobs[jobIndex].status === 'active' || task.jobs[jobIndex].status === 'submitted'))
          return res.status(422).send({
            message: 'Task is not active.'
          });
        task.jobs[jobIndex].status = 'submitted';
        
        // do the actual file submission
        var files = req.files.file;
        var fileIndex = 0;
        var filePath = '/taskSubmissions/taskId_' + taskId.toString() + '/workerId_' + typeObj._id.toString() + '/';
        writeFilesToPath(files[0], filePath, function (err) {
          if (err) {
            return res.status(422).send({
              message: 'Error writing files to proper path.'
            });
          } else {
            console.log('success')
            task.save(function (err, task) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              }
              console.log(JSON.stringify(task.jobs[jobIndex], null, 2));
              return res.status(200).send({
                message: 'Submission Successful!'
              });
            });
          }
        }, function(filePath, callBack, next) {
          fileIndex++;
          if (fileIndex < files.length - 1) {
            console.log('here1')
            writeFilesToPath(files[fileIndex], filePath, callBack, next);
          } else if (fileIndex < files.length) {
            console.log('here2')
            writeFilesToPath(files[fileIndex], filePath, callBack);
          } else {
            console.log('here3')
            return res.status(422).send({
              message: 'Error writing files to proper path.'
            });
          }
        });
      });
    }); 
  }
};

function removeExtraWorkers(tasks, workerId) {
  if (tasks) {
    var job = null;
    if (Array.isArray(tasks)) { // multiple tasks
      for (var task = 0; task < tasks.length; task++)
        if (tasks[task].jobs)
          for (job = 0; job < tasks[task].jobs.length; job++)
            if (tasks[task].jobs[job].worker.workerId.toString() !== workerId.toString())
              tasks[task].jobs.splice(job, 1);
    } else { // single task
      if (tasks.jobs)
        for (job = 0; job < tasks.jobs.length; job++)
          if (tasks.jobs[job].worker.workerId.toString() !== workerId.toString())
            tasks.jobs.splice(job, 1);
    }
  }
  return tasks;
}
