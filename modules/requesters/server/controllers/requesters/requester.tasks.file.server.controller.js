'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Requester = mongoose.model('Requester'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  taskFile = require(path.resolve('./modules/requesters/server/controllers/requesters/task.file.server.controller')),
  _ = require('lodash'),
  fs = require('fs');

var getRequesterMsgFileName = taskFile.getRequesterMsgFileName,
  getDownloadables = taskFile.getDownloadables,
  getDownloadFile = taskFile.getDownloadFile,
  sendMessage = taskFile.sendMessage,
  getUserTypeObject = taskTools.getUserTypeObject,
  ownsTask = taskTools.ownsTask,
  taskFindOne = taskSearch.taskFindOne,
  findJobByWorker = taskSearch.findJobByWorker,
  findBidByWorker = taskSearch.findBidByWorker;

function setUpRequesterFileExchange(req, res, callBack) {
  getUserTypeObject(req, res, function(typeObj) {
    var taskId = req.body.taskId;
    taskFindOne(taskId, function(err, task) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (!task) {
        return res.status(422).send({
          message: 'No task with that Id found.'
        });
      }
      if (!ownsTask(task, typeObj)) {
        return res.status(422).send({
          message: 'You don\'t own this task.'
        });
      }
      
      if (!req.body.workerId) {
        return res.status(422).send({
          message: 'No worker id provided.'
        });
      }

      if(!findJobByWorker(task, { _id: req.body.workerId }) && !findBidByWorker(task, { _id: req.body.workerId })) {
        return res.status(422).send({
          message: 'That id is not a worker for this task'
        });
      }
      callBack(typeObj, task);
    });
  });
}

function sendRequesterMessage(message, taskId, workerId, timeInMin, callBack) {
  return sendMessage(message, taskId, workerId, timeInMin, getRequesterMsgFileName(), function(err, msg, timeStamp) {
    if (err) return callBack(err);
    callBack(null, { files: [], messages: { requester: msg }, timeStamp: timeStamp });
  });
}

// for file upload
exports.taskFiles = {
  getDownloadables: function (req, res) {
    setUpRequesterFileExchange(req, res, function(typeObj, task) {
      getDownloadables(task._id, req.body.workerId, function(down) {
        return res.status(200).send(down);
      });
    });
  },
  downloadTaskFile: function(req, res) {
    setUpRequesterFileExchange(req, res, function(typeObj, task) {
      getDownloadFile(task._id, req.body.workerId, req.body.fileName, req.body.timeStamp, function(err, stat, filename, file) {
        if (err)
          return res.status(422).send({
            message: err
          });
        res.set('Content-Type', '*');
        res.set('Content-Length', stat.size);
        res.set('Content-Disposition', filename);
        return res.send(file);
      });
    });
  },
  sendMessage: function(req, res) {
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
  }
};

exports.setUpRequesterFileExchange = setUpRequesterFileExchange;
