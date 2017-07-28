'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Requester = mongoose.model('Requester'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  taskFile = require(path.resolve('./modules/requesters/server/controllers/requesters/task.file.server.controller')),
  _ = require('lodash'),
  fs = require('fs');
  
var getDirectories = taskFile.getDirectories,
  writeFilesToPath = taskFile.writeFilesToPath,
  makeDirectory = taskFile.makeDirectory,
  getUserTypeObject = taskTools.getUserTypeObject;
  