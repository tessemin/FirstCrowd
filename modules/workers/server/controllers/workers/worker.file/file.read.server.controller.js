'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpWorkerFileExchange', 'getDownloadables'];
var setUpWorkerFileExchange, getDownloadables;
[setUpWorkerFileExchange, getDownloadables] = moduleDependencies.assignDependantVariables(dependants);
  
module.exports.getWorkerDownloadables = function (req, res) {
  setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
    getDownloadables(task._id, typeObj._id, function(down) {
      return res.status(200).send(down);
    }, req.body.sinceTimeX);
  });
};
