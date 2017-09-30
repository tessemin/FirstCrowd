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

// allows worker to download a task file
module.exports.downloadTaskFile = function(req, res) {
  // set up the file exchange
  setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
    // get the file for the borwser to download
    getDownloadFile(task._id, typeObj._id, req.body.fileName, req.body.timeStamp, function(err, stat, filename, file) {
      if (err)
        return res.status(422).send({ message: err });
      // package and send the file
      res.set('Content-Type', '*');
      res.set('Content-Length', stat.size);
      res.set('Content-Disposition', filename);
      return res.send(file);
    });
  });
};
