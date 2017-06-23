'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  individualControler = require(path.resolve('./modules/individuals/server/controllers/individuals.server.controller')),
  enterpriseControler = require(path.resolve('./modules/enterprises/server/controllers/enterprises.server.controller')),
  _ = require('lodash');
  
var workerWhitelistedFields = ['progress'],
  taskId = null;
  
  
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
            return res.status(404).send({
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
    });
  },
  // add a new active task
  add: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task) {
            typeObj.worker.activeTasks.push(task._id);
            typeObj.save(function(err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          } else {
            return res.status(404).send({
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
        taskFindMany(typeObj.worker.activeTasks, function(err, tasks) {
          if (err) {
            return res.status(404).send({
              message: 'No active tasks were found'
            });
          }
          res.json({ activeTasks: tasks });
        })
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
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(404).send({
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
    });
  },
  // add a new rejected task
  add: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task) {
            typeObj.worker.rejectedTasks.push(task._id);
            typeObj.save(function(err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          } else {
            return res.status(404).send({
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
            return res.status(404).send({
              message: 'No rejected tasks were found'
            });
          }
          res.json({ rejectedTasks: tasks });
        })
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
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(404).send({
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
    });
  },
  // add a new completed task
  add: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task) {
            typeObj.worker.completedTasks.push(task._id);
            typeObj.save(function(err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          } else {
            return res.status(404).send({
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
            return res.status(404).send({
              message: 'No completed tasks were found'
            });
          }
          res.json({ completedTasks: tasks });
        })
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
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(404).send({
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
    });
  },
  // add a new inactive task
  add: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskId = req.body._id;
        taskFindOne(taskId, function(err, task) {
          if (err) {
            return res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          if (task) {
            typeObj.worker.inactiveTasks.push(task._id);
            typeObj.save(function(err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          } else {
            return res.status(404).send({
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
        taskFindMany(typeObj.worker.inactiveTasks, function(err, tasks) {
          if (err) {
            return res.status(404).send({
              message: 'No inactive tasks were found'
            });
          }
          res.json({ inactiveTasks: tasks });
        })
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
    getUserTypeObject(req, res, function (typeObj) {
      for (var index = 1; index < 21; index++) {
        var task = new Task();
        task.title = 'task: ' + index;
        task.description = 'What a Task ' + index + '!';
        task.skillsNeeded = ['skill1', 'skill2', 'skill3'];
        task.deadline = '09/25/2017';
        task.payment = {
          bidding: {
            bidable: false
          },
          staticPrice: 100
        };
        task.status = 'open';
        task.multiplicity = 10;
        task.preapproval = true;
        task.requester = typeObj._id;
        task.dateCreated = Date.now();
        typeObj.worker.activeTasks.push(task._id);
        task.save(function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
      typeObj.save(function(err) {
        if (err) {
          console.log(err);
        }
      });
      res.json({})
    });
  },
  // get all recomended tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      if (typeObj.worker) {
        taskFindMany(typeObj.worker.recomendedTasks, function(err, tasks) {
          if (err) {
            return res.status(404).send({
              message: 'No recomended tasks were found'
            });
          }
          res.json({ recomendedTasks: tasks });
        })
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
      return res.status(404).send({
        message: 'No Task with that identifier has been found'
      });
    }
    req.task = task;
    next();
  });
};

exports.getAllTasks = function (req, res) {
  Task.find({ secret: false }, function (err, tasks) {
    res.json({ tasks: tasks })
  });
};

exports.getOneTask = function(req, res) {
  taskId = req.body._id;
  taskFindOne(taskId, function(err, task) {
    if (err) {
      return res.status(404).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json({ task: task });
  });
};

function getUserTypeObject(req, res, callBack) {
  if (req.user.individual) {
    individualControler.findIndividual(req, res, callBack);
  } else if (req.user.enterprise) {
    enterpriseControler.findEnterprise(req, res, callBack);
  } else {
    return res.status(400).send({
      message: 'User has no valid Type'
    });
  }
}

function taskFindMany(taskArray, callBack) {
  Task.find({ '_id': { $in: taskArray }}, callBack);
}

function taskFindOne(taskId, callBack) {
  Task.find({ '_id': taskId, secret: false }, callBack);
}
