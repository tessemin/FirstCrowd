'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpRequesterFileExchange', 'getDownloadables'];
var setUpRequesterFileExchange, getDownloadables;
[setUpRequesterFileExchange, getDownloadables] = moduleDependencies.assignDependantVariables(dependants);

// get the downloadable files for a requester
module.exports.getRequesterDownloadables = function (req, res) {
  setUpRequesterFileExchange(req, res, function(typeObj, task) {
    // get a list of the downloadable files for the reuqester
    getDownloadables(task._id, req.body.workerId, function(down) {
      return res.status(200).send(down);
    }, req.body.sinceTimeX);
  });
};
