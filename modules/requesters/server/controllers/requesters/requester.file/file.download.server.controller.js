'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpRequesterFileExchange', 'getDownloadFile'];
var setUpRequesterFileExchange, getDownloadFile;
[setUpRequesterFileExchange, getDownloadFile] = moduleDependencies.assignDependantVariables(dependants);

// allows us to download a uploaded file
module.exports.downloadTaskFile = function(req, res) {
  // calls a function in this depends file
  setUpRequesterFileExchange(req, res, function(typeObj, task) {
    // get the file
    getDownloadFile(task._id, req.body.workerId, req.body.fileName, req.body.timeStamp, function(err, stat, filename, file) {
      if (err)
        return res.status(422).send({
          message: err
        });
      // send the file
      res.set('Content-Type', '*');
      res.set('Content-Length', stat.size);
      res.set('Content-Disposition', filename);
      return res.send(file);
    });
  });
};
