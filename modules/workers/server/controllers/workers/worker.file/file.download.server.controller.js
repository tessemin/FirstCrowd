'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpWorkerFileExchange', 'getDownloadFile'];
var setUpWorkerFileExchange, getDownloadFile;
[setUpWorkerFileExchange, getDownloadFile] = moduleDependencies.assignDependantVariables(dependants);
  
module.exports.downloadTaskFile = function(req, res) {
  setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
    getDownloadFile(task._id, typeObj._id, req.body.fileName, req.body.timeStamp, function(err, stat, filename, file) {
      if (err)
        return res.status(422).send({ message: err });
      res.set('Content-Type', '*');
      res.set('Content-Length', stat.size);
      res.set('Content-Disposition', filename);
      return res.send(file);
    });
  });
};
