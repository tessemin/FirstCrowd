'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Requester = mongoose.model('Requester'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  _ = require('lodash');

// functions for task tools
var getUserTypeObject = taskTools.getUserTypeObject,
  taskFindOne = taskTools.taskFindOne,
  taskFindMany = taskTools.taskFindMany;

exports.getRequesterData = {
  all: function(req, res) {
    
  },
  ratings: function(req, res) {
    
  }
};
