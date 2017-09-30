'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpWorkerFileExchange', 'sendWorkerMessage'];
var setUpWorkerFileExchange, sendWorkerMessage;
[setUpWorkerFileExchange, sendWorkerMessage] = moduleDependencies.assignDependantVariables(dependants);

// send a worker message
module.exports.sendMessage = function(req, res) {
  // set up the file exchange
  setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
    // send the worker message
    sendWorkerMessage(req.body.message, task._id, typeObj._id, null, function (err, message) {
      if (err)
        return res.status(422).send({
          message: err
        });
      return res.status(200).send({
        message: 'Message sent!',
        data: message
      });
    });
  });
};
