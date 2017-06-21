'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  User = mongoose.model('User'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  individualControler = require(path.resolve('./modules/individuals/server/controllers/individuals.server.controller')),
  enterpriseControler = require(path.resolve('./modules/enterprises/server/controllers/enterprises.server.controller')),
  _ = require('lodash');
  
/*
 * Active Tasks
 */
// get all active tasks or create a new task
exports.activeTasks = {
  read: function(req, res) {
    console.log('\n\n\n\n\n\n\n\n\n\n\nhere')
    return res.jsonp({ name: 'Mark' })
  },
  create: function(req, res) {
    
  }
}
// opperations on task ID
exports.activeTask = {
  read: function(req, res) {
    console.log('\n\n\n\n\n\n\n\n\n\n\nhere')
    return res.json({ name: 'Mark' })
  },
  update: function(req, res) {
  
  },
  delete: function(req, res) {
  
  }
}

/*
 * rejected Tasks
 */
// get all rejected tasks or create a new task
exports.rejectedTasks = {
  read: function(req, res) {

  },
  create: function(req, res) {
    
  }
}
// opperations on task ID
exports.rejectedTask = {
  read: function(req, res) {
    res.jsonp({});
  },
  update: function(req, res) {
  
  },
  delete: function(req, res) {
  
  }
}

/*
 * completed Tasks
 */
// get all completed tasks or create a new task
exports.completedTasks = {
  read: function(req, res) {

  },
  create: function(req, res) {
    
  }
}
// opperations on task ID
exports.completedTask = {
  read: function(req, res) {
    res.jsonp({});
  },
  update: function(req, res) {
  
  },
  delete: function(req, res) {
  
  }
}

/*
 * inactive Tasks
 */
// get all inactive tasks or create a new task
exports.inactiveTasks = {
  read: function(req, res) {

  },
  create: function(req, res) {
    
  }
}
// opperations on task ID
exports.inactiveTask = {
  read: function(req, res) {
    res.jsonp({});
  },
  update: function(req, res) {
  
  },
  delete: function(req, res) {
  
  }
}

/*
 * recomended Tasks
 */
// get all recomended tasks or create a new task
exports.recomendedTasks = {
  read: function(req, res) {

  }
}
// opperations on task ID
exports.recomendedTask = {
  read: function(req, res) {
    res.jsonp({});
  },
  update: function(req, res) {
  
  },
  delete: function(req, res) {
  
  }
}

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
