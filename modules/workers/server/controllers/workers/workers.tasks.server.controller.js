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
  
var superUser = null;
  
  
/*
 * Active Tasks
 */
// opperations on task ID
exports.activeTask = {
  // read a single active task
  read: function(req, res) {

    return res.json({ name: 'Mark' });
  },
  // update a single active task
  update: function(req, res) {
  
  },
  // delete a single active task
  delete: function(req, res) {
  
  },
  // create a new active task
  create: function (req, res) {
    
  },
  // get all active tasks
  all: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      console.log(typeObj)
    })
  }
};

/*
 * rejected Tasks
 */
// opperations on task ID
exports.rejectedTask = {
  // read a single rejected task
  read: function(req, res) {
    return res.json({ name: 'Mark' });
  },
  // update a single rejected task
  update: function(req, res) {
  
  },
  // delete a single rejected task
  delete: function(req, res) {
  
  },
  // create a new rejected task
  create: function (req, res) {
    
  },
  // get all rejected tasks
  all: function (req, res) {
    
  }
};

/*
 * completed Tasks
 */
// opperations on task ID
exports.completedTask = {
  // read a single completed task
  read: function(req, res) {
    return res.json({ name: 'Mark' });
  },
  // update a single completed task
  update: function(req, res) {
  
  },
  // delete a single completed task
  delete: function(req, res) {
  
  },
  // create a new completed task
  create: function (req, res) {
    
  },
  // get all completed tasks
  all: function (req, res) {
    
  }
};

/*
 * inactive Tasks
 */
// opperations on task ID
exports.inactiveTask = {
  // read a single inactive task
  read: function(req, res) {
    return res.json({ name: 'Mark' });
  },
  // update a single inactive task
  update: function(req, res) {
  
  },
  // delete a single inactive task
  delete: function(req, res) {
  
  },
  // create a new inactive task
  create: function (req, res) {
    
  },
  // get all inactive tasks
  all: function (req, res) {
    return res.json({ name: 'Mark' });
  }
};

/*
 * recomended Tasks
 */
// opperations on task ID
exports.recomendedTask = {
  // read a single recomended task
  read: function(req, res) {
    return res.json({ name: 'Mark' });
  },
  // update a single recomended task
  update: function(req, res) {
  
  },
  // delete a single recomended task
  delete: function(req, res) {
  
  },
  // get all recomended tasks
  all: function (req, res) {
    
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
