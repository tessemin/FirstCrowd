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
  _ = require('lodash');

var workerWhitelistedFields = ['progress'],
  taskId = null,
  // functions for task tools
  getUserTypeObject = taskTools.getUserTypeObject,
  getIdsInArray = taskTools.getIdsInArray,
  taskFindOne = taskSearch.taskFindOne,
  taskFindMany = taskSearch.taskFindMany,
  taskFindWithOption = taskSearch.taskFindWithOption,
  findTaskWorker = taskSearch.findTaskWorker;


/*
 * Active Tasks
 */
// opperations on task ID
exports.activeTask = {
  // update a single active task
  update: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          var taskWorker = findTaskWorker(task, typeObj);
          if (!taskWorker) {
            return res.status(422).send({
              message: 'You are not a worker for this task'
            });
          }
          taskWorker.save(function(err) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(taskWorker);
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
  // add a new active task
  add: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task) {
            typeObj.worker.activeTasks.push(task._id);
            typeObj.save(function(err) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                res.json(typeObj);
              }
            });
          } else {
            return res.status(422).send({
              message: 'Task ID is not valid'
            });
          }
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
        taskFindMany(typeObj.worker.activeTasks, false, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
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
  // update a single rejected task
  update: function(req, res) {
    /* getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          task = _.extend(task, _.pick(req.body, workerWhitelistedFields));
          task.save(function(err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.json(user);
            }
          });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    }); */
  },
  // add a new rejected task
  add: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task) {
            typeObj.worker.rejectedTasks.push(task._id);
            typeObj.save(function(err) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                res.json(typeObj);
              }
            });
          } else {
            return res.status(422).send({
              message: 'Task ID is not valid'
            });
          }
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  },
  // get all rejected tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(typeObj.worker.rejectedTasks, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
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
  // update a single completed task
  update: function(req, res) {
    /* getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          task = _.extend(task, _.pick(req.body, workerWhitelistedFields));
          task.save(function(err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.json(user);
            }
          });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    }); */
  },
  // add a new completed task
  add: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task) {
            typeObj.worker.completedTasks.push(task._id);
            typeObj.save(function(err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(typeObj);
              }
            });
          } else {
            return res.status(422).send({
              message: 'Task ID is not valid'
            });
          }
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  },
  // get all completed tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(typeObj.worker.completedTasks, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
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
  // update a single inactive task
  update: function(req, res) {
    /* getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          task = _.extend(task, _.pick(req.body, workerWhitelistedFields));
          task.save(function(err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.json(user);
            }
          });
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    }); */
  },
  // add a new inactive task
  add: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindOne(req.body.taskId, function(err, task) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task) {
            typeObj.worker.inactiveTasks.push(task._id);
            typeObj.save(function(err) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                res.json(typeObj);
              }
            });
          } else {
            return res.status(422).send({
              message: 'Task ID is not valid'
            });
          }
        });
      } else {
        return res.status(400).send({
          message: 'User does not have a valid worker'
        });
      }
    });
  },
  // get all inactive tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(typeObj.worker.inactiveTasks, false, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
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
  // update a single recomended task
  update: function(req, res) {

  },
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
    taskFindWithOption({ secret: false, status: 'open' }, { 'jobs': { $not: { $elemMatch: { 'worker': { 'workerId': typeObj._id }}}}}, function (err, tasks) {
      if (err)
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      return res.json({ tasks: tasks });
    });
  });
};

exports.getOneTask = function(req, res) {
  taskId = req.body.taskId;
  taskFindOne(taskId, function(err, task) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    return res.json({ task: task });
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
  req.body.secret = false;
  getUserTypeObject(req, res, function(typeObj) {
    taskFindWithOption(req.body , { 'jobs': { $not: { $elemMatch: { 'worker': { 'workerId': typeObj._id }}}}}, function(err, tasks) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      return res.json({ tasks: tasks });
    });
  });
}

function  removeExtraWorkers(tasks, workerId) {
  for (var i = 0; i < tasks.jobs.length; i++) {
    if (tasks.jobs[i],worker,workerId.toString() !== workerId.toString()) {
      tasks.splice(i, 1);
    }
  }
  return tasks;
}
