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
  taskFindMany = taskTools.taskFindMany;

exports.activeTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
};

exports.suspendedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
};

exports.completedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
};

exports.rejectedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
};

exports.workerRating = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
};

exports.taskActions = {
  create: function(req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      // user is signed in a requester
      if (req.user.userType.indexOf('requester') !== -1) {
        var newTask = new Task(req.body);
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

  },
  update: function(req, res) {

  }
}