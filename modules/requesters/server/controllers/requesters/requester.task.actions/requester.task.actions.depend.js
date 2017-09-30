'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));

var hashObjId = moduleDependencies.getDependantByKey('hashObjId');

// todo: move to indidvidual controllers
// for each array of ids reaturn the list of individuals
module.exports.getMongoIndividuals = function(indIds, callBack) {
  if (indIds.length > 0)
    // find all the individuals and return
    Individual.find({ '_id': { $in: indIds } }, function(err, inds) {
      if (err)
        callBack(errorHandler.getErrorMessage(err));
      if (inds)
        return callBack(null, inds);
      return callBack(null, []);
    });
  else
    return callBack(null, []);
};

// todo: move to enterprise controllers
// for each array of ids reaturn the list of enterprises
module.exports.getMongoEnterprises = function(entIds, callBack) {
  if (entIds.length > 0)
  // find all the erterprises and return
    Enterprise.find({ '_id': { $in: entIds } }, function(err, ents) {
      if (err)
        callBack(errorHandler.getErrorMessage(err));
      if (ents)
        return callBack(null, ents);
      return callBack(null, []);
    });
  else
    return callBack(null, []);
};

// returns a task with a hashedworkerId for each worker in this task
module.exports.mapTaskJobToDisplay = function(tasks) {
  return tasks.map(function(task) {
    task = JSON.parse(JSON.stringify(task));
    task.jobs = task.jobs.map(function(job) {
      if (job.worker)
        job.worker.displayId = hashObjId(job.worker.workerId);
      return job;
    });
    return task;
  });
};

// extend the depends files
_.extend(
  module.exports,
  require('./requester.task.actions.bid/requester.task.actions.bid.depend'),
  require('./requester.task.actions.crud/requester.task.actions.crud.depend'),
  require('./requester.task.actions.ratings/requester.task.actions.ratings.depend'),
  require('./requester.task.actions.status/requester.task.actions.status.depend'),
  require('./requester.task.actions.submission/requester.task.actions.submission.depend')
);
