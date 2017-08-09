'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskDepend = require(path.resolve('./modules/requesters/server/controllers/requesters/task.depend.server.controller')),
  Fuse = require('fuse.js'),
  _ = require('lodash');
  
var isRequester = taskDepend.isRequester,
  isWorker = taskDepend.isWorker,
  getIdsInArray = taskDepend.getIdsInArray,
  getUserTypeObject = taskDepend.getUserTypeObject;


function taskFindMany(taskArray, secretAllowed, callBack) {
  if (!taskArray || taskArray.length <= 0)
    return callBack(null, []);
  if (secretAllowed)
    Task.find({ '_id': { $in: taskArray } }, callBack);
  else
    Task.find({ '_id': { $in: taskArray }, secret: false }, callBack);
}

function taskFindOne(taskId, callBack) {
  Task.findById(taskId, function (err, task) { callBack(err, task); });
}

function taskFindWithOption(options, nonOptions, callBack) {
  var requestOptions = [];
  if (Array.isArray(options))
    requestOptions = requestOptions.concat(options);
  else
    requestOptions.push(options);
  if (Array.isArray(nonOptions))
    requestOptions = requestOptions.concat(nonOptions);
  else
    requestOptions.push(nonOptions);

  Task.find({ $and: requestOptions }, callBack);
}

function findTaskWorker(task, worker) {
  var job = findJobByWorker(task, worker);
  if (job)
    return job.worker;
  return false;
}

function findJobByWorker(task, worker) {
  if (task && task.jobs && worker)
    for (var i = 0; i < task.jobs.length; i++) {
      if (task.jobs[i] && task.jobs[i].worker && task.jobs[i].worker.workerId)
        if (task.jobs[i].worker.workerId.toString() === worker._id.toString()) {
          return task.jobs[i];
        }
    }
  return false;
}

function findBidByWorker(task, worker) {
  if (task && task.bids && worker)
    for (var i = 0; i < task.bids.length; i++) {
      if (task.bids[i] && task.bids[i].worker && task.bids[i].worker.workerId)
        if (task.bids[i].worker.workerId.toString() === worker._id.toString()) {
          return task.bids[i];
        }
    }
  return false;
}

function findRequesterByTask(task, callBack) {
  if (task && task.requester) {
    if (task.requester.requesterType.enterprise && !task.requester.requesterType.individual) {
      Enterprise.findById(task.requester.requesterId, function (err, requester) { 
        if (err) {
          callBack({ error: errorHandler.getErrorMessage(err) });
        }
        if (requester)
          callBack(null, requester);
        else
          callBack('no requester found');
      });
    } else if (task.requester.requesterType.individual && !task.requester.requesterType.enterprise) {
      Individual.findById(task.requester.requesterId, function (err, requester) { 
        if (err) {
          callBack({ error: errorHandler.getErrorMessage(err) });
        }
        if (requester)
          callBack(null, requester);
        else
          callBack('no requester found');
      });
    } else {
      Enterprise.findById(task.requester.requesterId, function (err, requester) { 
        if (err) {
          callBack({ error: errorHandler.getErrorMessage(err) }); 
        }
        if (requester)
          callBack(requester);
        else
          Individual.findById(task.requester.requestrerId, function (err, requester) { 
            if (err) {
              callBack(errorHandler.getErrorMessage(err)); 
            }
            if (requester)
              callBack(null, requester);
            else
              callBack('no requester found');
          });
      });
    }
  } else {
    callBack('Must provide a task');
  }
}

function findWorkerByWorkerTaskObject(workerTaskObj, callBack) {
  if (workerTaskObj)
    if (workerTaskObj.workerType.enterprise && !workerTaskObj.workerType.individual) {
      Enterprise.findById(workerTaskObj.workerId, function (err, worker) { 
        if (err) {
          callBack(errorHandler.getErrorMessage(err)); 
        }
        if (worker)
          callBack(null, worker);
        else
          callBack('no worker found');
      });
    } else if (workerTaskObj.workerType.individual && !workerTaskObj.workerType.enterprise) {
      Individual.findById(workerTaskObj.workerId, function (err, worker) { 
        if (err) {
          callBack(errorHandler.getErrorMessage(err)); 
        }
        if (worker)
          callBack(null, worker);
        else
          callBack('no worker found');
      });
    } else {
      Enterprise.findById(workerTaskObj.workerId, function (err, worker) { 
        if (err) {
          callBack(errorHandler.getErrorMessage(err)); 
        }
        if (worker)
          callBack(null, worker);
        else
          Individual.findById(workerTaskObj.workerId, function (err, worker) { 
            if (err) {
              callBack(errorHandler.getErrorMessage(err)); 
            }
            if (worker)
              callBack(null, worker);
            else
              callBack('no worker found');
          });
      });
    }
  else
    callBack({ error: 'No worker provided' }); 
}

exports.searchTasks = {
  searchOpenTasks: function (req, res) {
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
  },
  searchMyTasks: function (req, res) {
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
      
      searchTasks(query, null, function(err, results) {
        if (err)
          return res.status(422).send({
            message: err
          });
        res.json({ results: results });
      });
    });
  }
};

function searchTasks(query, extraTerms, callBack) {
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
  }
  else if (query.payment && query.payment.staticPrice) { // regular price options
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
  console.log(mongoOptions)
  taskFindWithOption({ $and: mongoOptions }, {}, function (err, tasks) {
    if (err)
      return callBack(errorHandler.getErrorMessage(err));
    if (query.searchTerm) {
      var fuse = new Fuse(tasks, FuseOptions);
      tasks = fuse.search(query.searchTerm);
    }
    callBack(null, tasks);
  });
}

exports.taskFindMany = taskFindMany;
exports.taskFindOne = taskFindOne;
exports.findTaskWorker = findTaskWorker;
exports.taskFindWithOption = taskFindWithOption;
exports.findTaskWorker = findTaskWorker;
exports.findJobByWorker = findJobByWorker;
exports.findBidByWorker = findBidByWorker;
exports.findRequesterByTask = findRequesterByTask;
exports.findWorkerByWorkerTaskObject = findWorkerByWorkerTaskObject;
