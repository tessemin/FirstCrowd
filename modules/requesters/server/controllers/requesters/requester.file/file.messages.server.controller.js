'use strict';

/**
 * Module dependencies.
 */
var path = require('path');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpRequesterFileExchange', 'sendRequesterMessage'];
var setUpRequesterFileExchange, sendRequesterMessage;
[setUpRequesterFileExchange, sendRequesterMessage] = moduleDependencies.assignDependantVariables(dependants);

module.exports.sendMessage = function(req, res) {
  setUpRequesterFileExchange(req, res, function(typeObj, task) {
    sendRequesterMessage(req.body.message, task._id, req.body.workerId, null, function (err, message) {
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
