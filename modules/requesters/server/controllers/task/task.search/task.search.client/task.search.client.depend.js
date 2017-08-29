'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Fuse = require('fuse.js');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['taskFindWithOption'];
var taskFindWithOption;
[taskFindWithOption] = moduleDependencies.assignDependantVariables(dependants);

module.exports.searchTasks = function(query, extraTerms, callBack) {
  var mongoOptions = [];
  var FuseOptions = {
    shouldSort: true,
    threshold: 0.30,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: []
  };
  // fuse options
  if (query.title)
    FuseOptions.keys.push('title');
  if (query.description)
    FuseOptions.keys.push('description');
  if (query.skills)
    FuseOptions.keys.push('skillsNeeded');
  if (query.category)
    FuseOptions.keys.push('category');
  if (query.status)
    FuseOptions.keys.push('status');
  
  if (query.bidding && query.bidding.bidable)
    mongoOptions.push({ payment: { bidding: { bidable: { $eq: true } } } });
  // bidding price options
  if (query.payment && query.payment.bidding && query.payment.bidding.bidable && query.payment.bidding) {
    if (query.payment.bidding.startingPrice) {
      if (query.payment.bidding.startingPrice.equals) {
        mongoOptions.push({ payment: { bidding: { startingPrice: { $eq: query.payment.bidding.startingPrice.equals } } } });
      } else {
        if (query.payment.bidding.startingPrice.max)
          mongoOptions.push({ payment: { bidding: { startingPrice: { $lte: query.payment.bidding.startingPrice.max } } } });
        if (query.payment.bidding.startingPrice.min)
          mongoOptions.push({ payment: { bidding: { startingPrice: { $gte: query.payment.bidding.startingPrice.min } } } });
      }
    }
    if (query.payment.bidding.minPrice) {
      if (query.payment.bidding.minPrice.equals) {
        mongoOptions.push({ payment: { bidding: { minPrice: { $eq: query.payment.bidding.minPrice.equals } } } });
      } else {
        if (query.payment.bidding.minPrice.max)
          mongoOptions.push({ payment: { bidding: { minPrice: { $lte: query.payment.bidding.minPrice.max } } } });
        if (query.payment.bidding.minPrice.min)
          mongoOptions.push({ payment: { bidding: { minPrice: { $gte: query.payment.bidding.minPrice.min } } } });
      }
    }
  } else if (query.payment && query.payment.staticPrice) { // regular price options
    if (query.payment.staticPrice.equals) {
      mongoOptions.push({ payment: { staticPrice: { $eq: query.payment.staticPrice.equals } } });
    } else {
      if (query.payment.staticPrice.max)
        mongoOptions.push({ payment: { staticPrice: { $lte: query.payment.staticPrice.max } } });
      if (query.payment.staticPrice.min)
        mongoOptions.push({ payment: { staticPrice: { $gte: query.payment.staticPrice.min } } });
    }
  }
  // bidding date range
  if (query.payment && query.payment.bidding && query.payment.bidding.bidable && query.payment.bidding.timeRange) {
    if (query.payment.bidding.timeRange.start) {
      if (query.payment.bidding.timeRange.start.equals) {
        mongoOptions.push({ payment: { bidding: { timeRange: { start: { $eq: query.payment.bidding.timeRange.start.equals } } } } });
      } else {
        if (query.payment.bidding.timeRange.start.max)
          mongoOptions.push({ payment: { bidding: { timeRange: { start: { $lte: query.payment.bidding.timeRange.start.max } } } } });
        if (query.payment.bidding.timeRange.start.min)
          mongoOptions.push({ payment: { bidding: { timeRange: { start: { $gte: query.payment.bidding.timeRange.start.min } } } } });
      }
    }
    if (query.payment.bidding.timeRange.end) {
      if (query.payment.bidding.timeRange.end.equals) {
        mongoOptions.push({ payment: { bidding: { timeRange: { end: { $eq: query.payment.bidding.timeRange.end.equals } } } } });
      } else {
        if (query.payment.bidding.timeRange.end.max)
          mongoOptions.push({ payment: { bidding: { timeRange: { end: { $lte: query.payment.bidding.timeRange.end.max } } } } });
        if (query.payment.bidding.timeRange.end.min)
          mongoOptions.push({ payment: { bidding: { timeRange: { end: { $gte: query.payment.bidding.timeRange.end.min } } } } });
      }
    }
  }
  // deadline
  if (query.deadline) {
    if (query.deadline.equals)
      mongoOptions.push({ deadline: { $eq: query.deadline.equals } });
    else {
      if (query.deadline.max)
        mongoOptions.push({ deadline: { $lte: query.deadline.max } });
      if (query.deadline.min)
        mongoOptions.push({ deadline: { $gte: query.deadline.min } });
    }
  }
  if (!query.secret) {
    mongoOptions.push({ secret: { $eq: false } });
  }
  
  // searches for specific ids
  if (query.taskIds)
    mongoOptions.push({ '_id': { $in: query.taskIds } });
  
  if (extraTerms)
    if (Array.isArray(extraTerms))
      mongoOptions = mongoOptions.concat(extraTerms);
    else
      mongoOptions.push(extraTerms);

  taskFindWithOption({ $and: mongoOptions }, {}, function (err, tasks) {
    if (err)
      return callBack(errorHandler.getErrorMessage(err));
    if (query.searchTerm) {
      var fuse = new Fuse(tasks, FuseOptions);
      tasks = fuse.search(query.searchTerm);
    }
    callBack(null, tasks);
  });
};
