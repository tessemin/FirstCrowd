'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  taskFile = require(path.resolve('./modules/requesters/server/controllers/requesters/task.file.server.controller')),
  _ = require('lodash'),
  fs = require('fs');


var writeFilesToPath = taskFile.writeFilesToPath,
  getTimeInMinutes = taskFile.getTimeInMinutes,
  getSubmissionMsgFileName = taskFile.getSubmissionMsgFileName,
  getWorkerMsgFileName = taskFile.getWorkerMsgFileName,
  getFilePath = taskFile.getFilePath,
  getDownloadables = taskFile.getDownloadables,
  getDownloadFile = taskFile.getDownloadFile,
  sendMessage = taskFile.sendMessage,
  sendSubmissionMessage = taskFile.sendSubmissionMessage,
  getUserTypeObject = taskTools.getUserTypeObject,
  updateTotalTaskProgress = taskTools.updateTotalTaskProgress,
  taskFindOne = taskSearch.taskFindOne;
  
function isWorkerForTask(jobs, Id) {
  var jobIndex = 0,
    jobFound = false;
  while (jobIndex < jobs.length) {
    if (jobs[jobIndex].worker.workerId.toString() === Id.toString()) {
      jobFound = true;
      break;
    }
    jobIndex++;
  }
  if (!jobFound) {
    return -1;
  }
  return jobIndex;
}

function youAreActiveOnTask(task, job) {
  if ((job.status === 'active' || job.status === 'submitted') && (task.status === 'open' || task.status === 'taken'))
    return true;
  return false;
} 

function setUpWorkerFileExchange(req, res, callBack) {
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
      var jobIndex = isWorkerForTask(task.jobs, typeObj._id)
      if (jobIndex < 0) {
        return res.status(422).send({
          message: 'You are not a worker for this task.'
        });
      }
      return callBack(typeObj, task, jobIndex);
    });
  });
}

exports.markTaskCompleted = function (req, res) {
  setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
    if (task.jobs[jobIndex].status !== 'active' || !(task.status === 'open' || task.status === 'taken')) {
      return res.status(422).send({
        message: 'You are not a active worker for this task.'
      });
    }
    task.jobs[jobIndex].status = 'submitted';
    task.jobs[jobIndex].progress = 100;
    updateTotalTaskProgress(task, function(response) {
      if (!response)
        return res.status(422).send({
          message: 'Error seting total progress'
        });
      else if (response.error)
        return res.status(422).send({
          message: response.error
        });
      else
        return res.status(200).send({
          message: 'Task Marked Completed!'
        });
    });
  });
}

// for file upload
exports.taskFiles = {
  submitTaskFiles: function(req, res) {
    setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
      
      if (!youAreActiveOnTask(task, task.jobs[jobIndex])) 
        return res.status(422).send({
          message: 'Task is not active.'
        });
      
      // do the actual file submission
      var files = req.files.file;
      var fileIndex = 0;
      var stringInMinutes = getTimeInMinutes();
      getFilePath(task._id, typeObj._id, stringInMinutes, function (err, filePath) {
        writeFilesToPath(files[fileIndex], filePath, function (err) {
          if (err)
            return res.status(422).send({
              message: 'Error writing files to proper path.'
            });
          if (req.body.message && req.body.message.length > 0) {
            sendSubmissionMessage(req.body.message, task._id, typeObj._id, stringInMinutes, function (err) {
              if (err) {
                return res.status(422).send({
                  message: 'Files submitted, error sending message.'
                });
              }
              return res.status(200).send({
                message: 'Submission Successful!'
              });
            });
          } else {
            return res.status(200).send({
              message: 'Submission Successful!'
            });
          }
        }, function(filePath, callBack, next) { // next function
          fileIndex++;
          if (fileIndex < files.length) {
            writeFilesToPath(files[fileIndex], filePath, callBack, next);
          } else {
            callBack();
          }
        });
      });
    });
  },
  getDownloadables: function (req, res) {
    setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
      getDownloadables(task._id, typeObj._id, function(down) {
        return res.status(200).send(down);
      });
    });
  },
  downloadTaskFile: function(req, res) {
    setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
      getDownloadFile(task._id, typeObj._id, req.body.fileName, req.body.timeStamp, function(err, stat, filename, file) {
        if (err)
          return res.status(422).send({ message: err });
        res.set('Content-Type', '*');
        res.set('Content-Length', stat.size);
        res.set('Content-Disposition', filename);
        return res.send(file);
      });
    });
  },
  sendMessage: function(req, res) {
    setUpWorkerFileExchange(req, res, function(typeObj, task, jobIndex) {
      if (!youAreActiveOnTask(task, task.jobs[jobIndex])) 
        return res.status(422).send({
          message: 'Task is not active.'
        });
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
  }
};

function sendWorkerMessage(message, taskId, workerId, timeInMin, callBack) {
  return sendMessage(message, taskId, workerId, timeInMin, getWorkerMsgFileName(), function(err, msg, timeStamp) {
    if (err) return callBack(err);
    callBack(null, { files: [], messages: { worker: msg }, timeStamp: timeStamp });
  });
}
