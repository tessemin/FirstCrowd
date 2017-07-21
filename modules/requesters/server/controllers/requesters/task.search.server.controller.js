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
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  requesterTasks = require(path.resolve('./modules/requesters/server/controllers/requesters/requesters.tasks.server.controller')),
  Fuse = require('fuse.js'),
  _ = require('lodash');
  
var isRequester = taskTools.isRequester,
  isWorker = taskTools.isWorker,
  getIdsInArray = taskTools.getIdsInArray,
  getUserTypeObject = taskTools.getUserTypeObject,
  getAllRequesterTasks = requesterTasks.getAllRequesterTasks;


function taskFindMany(taskArray, secretAllowed, callBack) {
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
          callBack({ error: errorHandler.getErrorMessage(err) }); 
        }
        if (worker)
          callBack(null, worker);
        else
          callBack('no worker found');
      });
    } else if (workerTaskObj.workerType.individual && !workerTaskObj.workerType.enterprise) {
      Individual.findById(workerTaskObj.workerId, function (err, worker) { 
        if (err) {
          callBack({ error: errorHandler.getErrorMessage(err) }); 
        }
        if (worker)
          callBack(null, worker);
        else
          callBack('no worker found');
      });
    } else {
      Enterprise.findById(workerTaskObj.workerId, function (err, worker) { 
        if (err) {
          callBack({ error: errorHandler.getErrorMessage(err) }); 
        }
        if (worker)
          callBack(worker);
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
      if (query) {
        taskFindWithOption({ status: 'open', secret: false },
          [{ 'jobs': { $not: { $elemMatch: { 'worker.workerId': typeObj._id } } } },
          { 'requester.requesterId': { $ne: typeObj._id } }],
        function (err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            var results = searchTasks(tasks, query);
            res.json({ searchResults: results });
          }
        });
      }
    });
  },
  searchMyTasks: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      var query = req.body.query;
      if (isRequester(req.user)) {
        getAllRequesterTasks(req, res, function (tasks) {
          var results = searchTasks(tasks, query, ['secret']);
          res.json({ searchResults: results });
        });
      } else if (isWorker(req.user)) {
        var ids = [].concat(getIdsInArray(typeObj.worker.activeTasks), getIdsInArray(typeObj.worker.rejectedTasks), getIdsInArray(typeObj.worker.inactiveTasks), getIdsInArray(typeObj.worker.completedTasks), getIdsInArray(typeObj.worker.recomendedTasks));
        taskFindMany(ids, true, function(err, tasks) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            var results = searchTasks(tasks, query, ['secret']);
            res.json({ searchResults: results });
          }
        });
      } else {
        return res.status(422).send({
          message: 'Please sign in as either a worker or requester.'
        });
      }
    });
  }
};

function searchTasks(tasks, query, optionalKeys) {
  var options = {
    shouldSort: true,
    threshold: 0.15,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      'title',
      'description',
      'category',
      'skillsNeeded',
      'payment.staticPrice',
      'deadline',
      'secondarySearch'
    ]
  };
  if (optionalKeys)
    options.keys = options.keys.concat(optionalKeys);
  
  var results = [];
  if (query.match('[0-9]+')) { // it is a number check classification codes
    query = parseFloat(query);
    tasks.forEach(function(task) {
      if (task.payment.bidding.bidable) {
        var startBid = parseFloat(task.payment.bidding.startingPrice),
          thresholdStart = startBid * parseFloat(options.threshold);
        var minBid = parseFloat(task.payment.bidding.minPrice),
          thresholdMin = minBid * parseFloat(options.threshold);
        if (((startBid + thresholdStart) >= query && query >= (startBid - thresholdStart)) || ((minBid + thresholdMin) >= query && query >= (minBid - thresholdMin))) {
          results.push(task);
        }
      } else {
        var staticBid = parseFloat(task.payment.staticPrice),
          thresholdStatic = staticBid * parseFloat(options.threshold);
        if ((staticBid + thresholdStatic) >= query && query >= (staticBid - thresholdStatic)) {
          results.push(task);
        }
      }
    });
  } else { // this is a letter query
    tasks = tasks.map(function(task) {
      task = JSON.parse(JSON.stringify(task));
      task.secondarySearch = [];
      if (task.preapproval) {
        task.secondarySearch.push('preapproval');
        task.secondarySearch.push('approval');
      }
      if (task.deadline) {
        task.secondarySearch.push(Date(task.deadline).toISOString().slice(0, 10).replace(/-/g, '/'));
        task.secondarySearch.push(Date(task.deadline).toISOString().slice(0, 10).replace(/-/g, ' '));
        task.secondarySearch.push(Date(task.deadline).toISOString().slice(0, 10));
      }
      if (task.payment.bidding.bidable) {
        task.secondarySearch.push('bidding');
        task.secondarySearch.push('bids');
        task.secondarySearch.push('biddable');
      }
      if (task.secret && options.keys.indexOf('secret') > -1)
        task.secondarySearch.push('secret');
      return task;
    });
    var fuse = new Fuse(tasks, options);
    results = fuse.search(query);
  }
  return results;
}

exports.taskFindMany = taskFindMany;
exports.taskFindOne = taskFindOne;
exports.findTaskWorker = findTaskWorker;
exports.taskFindWithOption = taskFindWithOption;
exports.findTaskWorker = findTaskWorker;
exports.findJobByWorker = findJobByWorker;
exports.findRequesterByTask = findRequesterByTask;
exports.findWorkerByWorkerTaskObject = findWorkerByWorkerTaskObject;
