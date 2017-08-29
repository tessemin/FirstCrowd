'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Fuse = require('fuse.js');
  
// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'searchTasks', 'isRequester', 'getIdsInArray', 'isWorker'];
var getUserTypeObject, searchTasks, isRequester, getIdsInArray, isWorker;
[getUserTypeObject, searchTasks, isRequester, getIdsInArray, isWorker] = moduleDependencies.assignDependantVariables(dependants);

module.exports.searchOpenTasks = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    var query = req.body.query;
    query.secret = false;
    searchTasks(query, [{ 'jobs': { $not: { $elemMatch: { 'worker.workerId': typeObj._id } } } },
      { 'requester.requesterId': { $ne: typeObj._id } }],
      function(err, results) {
        if (err)
          return res.status(422).send({
            message: err
          });
        res.json({ results: results });
      });
  });
};
module.exports.searchMyTasks = function (req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    var query = {};
    query.searchTerm = req.body.query;
    var ids = [];
    if (isRequester(req.user)) {
      ids = [].concat(getIdsInArray(typeObj.requester.activeTasks), getIdsInArray(typeObj.requester.suspendedTasks), getIdsInArray(typeObj.requester.completedTasks), getIdsInArray(typeObj.requester.rejectedTasks));
    } else if (isWorker(req.user)) {
      ids = [].concat(getIdsInArray(typeObj.worker.activeTasks), getIdsInArray(typeObj.worker.rejectedTasks), getIdsInArray(typeObj.worker.inactiveTasks), getIdsInArray(typeObj.worker.completedTasks), getIdsInArray(typeObj.worker.recomendedTasks));
    } else {
      return res.status(422).send({
        message: 'Please sign in as either a worker or requester.'
      });
    }
    query.secret = true;
    query.taskIds = ids;
    query.title = true;
    query.description = true;
    query.skills = true;
    query.category = true;
    query.status = true;
    
    searchTasks(query, null, function(err, results) {
      if (err)
        return res.status(422).send({
          message: err
        });
      res.json({ results: results });
    });
  });
};
