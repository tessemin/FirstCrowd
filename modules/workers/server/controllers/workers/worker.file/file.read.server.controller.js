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

// get the downloables for a worker
module.exports.getWorkerDownloadables = function (req, res) {
  // set up the worker file exchange
  setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
    // and get the downloables
    getDownloadables(task._id, typeObj._id, function(down) {
      return res.status(200).send(down);
    }, req.body.sinceTimeX);
  });
};
