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


var getDirectories = taskFile.getDirectories,
  writeFilesToPath = taskFile.writeFilesToPath,
  makeDirectory = taskFile.makeDirectory,
  getTimeInMinutes = taskFile.getTimeInMinutes,
  getUserTypeObject = taskTools.getUserTypeObject,
  taskFindOne = taskSearch.taskFindOne;

function getWorkerMsgFileName() {
  return 'workerMessages.txt'
}

function getRequesterMsgFileName() {
  return 'requesterMessages.txt';
}

function getSubmissionMsgFileName() {
  return 'submissionMessages.txt';
}

function getFilePath(taskId, workerId, timeInMin, callBack) {
  if (!timeInMin)
    timeInMin = getTimeInMinutes();
  var dir = './resources/taskSubmissions';
  if (taskId) {
    dir += '/taskId_' + taskId.toString();
    if (workerId) {
      dir += '/workerId_' + workerId.toString();
      if (timeInMin > 0)
        dir += '/' + timeInMin;
    }
  }
  dir = path.resolve(dir);
  makeDirectory(dir, function (err) {
    if (err)
      return callBack(err)
    return callBack(null, dir)
  });
}

function getMessagePath(taskId, workerId, timeInMin, callBack) {
  if (!timeInMin)
    timeInMin = getTimeInMinutes();
  var dir = path.resolve('./resources/taskSubmissions/taskId_' + taskId.toString() + '/workerId_' + workerId.toString() + '/' + timeInMin + '/messages');
  makeDirectory(dir, function (err) {
    if (err)
      return callBack(err)
    return callBack(null, dir)
  });
}

function getFilesInTask(taskDir, forEach, callBack) {
  var subDir = getDirectories(taskDir);
  subDir.reverse();
  subDir.forEach(function (sub) {
    var subDir = path.resolve(taskDir + '/' + sub);
    if (fs.existsSync(subDir)) {
      var timeStampFiles = fs.readdirSync(subDir);
      var files = [];
      timeStampFiles.forEach(function(file) {
        if (!fs.lstatSync(path.resolve(subDir + '/' + file)).isDirectory())
          files.push({
            name: file,
            timeStamp: sub
          })
      });
      var messagePath = path.resolve(subDir + '/messages/' + getRequesterMsgFileName());
      if (fs.existsSync(submissionMessagePath))
        var requesterMessage = fs.readFileSync(messagePath, 'utf8');
      messagePath = path.resolve(subDir + '/messages/' + getWorkerMsgFileName());
      if (fs.existsSync(submissionMessagePath))
        var workerMessage = fs.readFileSync(messagePath, 'utf8');
      messagePath = path.resolve(subDir + '/messages/' + getSubmissionMsgFileName());
      if (fs.existsSync(submissionMessagePath))
        var submissionMessage = fs.readFileSync(messagePath, 'utf8');
      forEach(sub, files, { submission: submissionMessage, worker: workerMessage, requester: requesterMessage });
    }
  });
  callBack();
}

function getFilesInTask(taskDir, forEach, callBack) {
  var subDir = getDirectories(taskDir);
  subDir.reverse();
  subDir.forEach(function (sub) {
    var subDir = path.resolve(taskDir + '/' + sub);
    if (fs.existsSync(subDir)) {
      var timeStampFiles = fs.readdirSync(subDir);
      var files = [];
      timeStampFiles.forEach(function(file) {
        if (!fs.lstatSync(path.resolve(subDir + '/' + file)).isDirectory())
          files.push({
            name: file,
            timeStamp: sub
          })
      });
      var submissionMessagePath = path.resolve(subDir + '/messages/' + getSubmissionMsgFileName())
      var submissionMessage = '';
      if (fs.existsSync(submissionMessagePath))
        submissionMessage = fs.readFileSync(submissionMessagePath, 'utf8');
      forEach(sub, files, { submission: submissionMessage});
    }
  });
  callBack();
}
  
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

function setUpFileExchange(req, res, callBack) {
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
      callBack(typeObj, task, jobIndex);
    });
  });
}

exports.markTaskCompleted = function (req, res) {
  setUpFileExchange(req, res, function(typeObj, task, jobIndex) {
    task.jobs[jobIndex].status = 'submitted';
    task.save(function (err, task) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      return res.status(200).send({
        message: 'Task Marked Completed!'
      });
    });
  });
}

// for file upload
exports.taskFiles = {
  submitTaskFiles: function(req, res) {
    setUpFileExchange(req, res, function(typeObj, task, jobIndex) {
      
      if (!youAreActiveOnTask(task, task.jobs[jobIndex])) 
        return res.status(422).send({
          message: 'Task is not active.'
        });
      
      // do the actual file submission
      var files = req.files.file;
      console.log(files)
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
    setUpFileExchange(req, res, function(typeObj, task, jobIndex) {
      getFilePath(task._id, typeObj._id, -1, function (err, taskWorkerDir) {
        var files = [];
        getFilesInTask(taskWorkerDir, function(sub, fils, messages) {
          files.push({ files: fils, messages: messages, timeStamp: sub });
        }, function () {
          return res.status(200).send({ down: files });
        });
      });
    });
  },
  downloadTaskFile: function(req, res) {
    setUpFileExchange(req, res, function(typeObj, task, jobIndex) {
      var file = {};
      var filename = file.name = req.body.fileName;
      getFilePath(task._id, typeObj._id, req.body.timeStamp, function (err, filePath) {
        filePath = file.path = path.resolve(filePath + '/' + filename);
        if (!fs.existsSync(filePath)) {
          return res.status(422).send({
            message: 'That file doesn\'t exist.'
          });
        }
        var stat = fs.statSync(filePath);
        var fileToSend = fs.readFileSync(filePath);
        res.set('Content-Type', '*');
        res.set('Content-Length', stat.size);
        res.set('Content-Disposition', filename);
        res.send(fileToSend);
      });
    });
  },
  sendMessage: function(req, res) {
    setUpFileExchange(req, res, function(typeObj, task, jobIndex) {
      if (!youAreActiveOnTask(task, task.jobs[jobIndex])) 
        return res.status(422).send({
          message: 'Task is not active.'
        });
      sendWorkerMessage(req.body.message, task._id, typeObj._id, null, function (err) {
        if (err)
          return res.status(422).send({
            message: err
          });
        return res.status(200).send({
          message: 'Message sent!'
        });
      });
    });
  },
  getMessages: function(req, res) {
    var dir = path.resolve('./resources/taskSubmissions/taskId_' + task._id.toString() + '/workerId_' + typeObj._id.toString());
    var workerPath = path.resolve(dir + '/workerMessages.txt');
    var requesterPath = path.resolve(dir + '/requesterMessages.txt');
    if (!fs.existsSync(dir))
      return res.status(200).send({
        messages: []
      });
    var workerMessages = [];
    if (fs.existsSync(workerPath)) {
      
    }
    var requesterMessages = [];
    if (fs.existsSync(requesterPath)) {
      
    }
      
  }
};

function sendWorkerMessage(message, taskId, workerId, timeInMin, callBack) {
  return sendMessage(message, taskId, workerId, timeInMin, getWorkerMsgFileName(), callBack);
}

function sendSubmissionMessage(message, taskId, workerId, timeInMin, callBack) {
  return sendMessage(message, taskId, workerId, timeInMin, getSubmissionMsgFileName(), callBack);
}

function sendMessage(message, taskId, workerId, timeInMin, fileName, callBack) {
  if (message) {
    if (!timeInMin)
      timeInMin = getTimeInMinutes();
    message = message + '\n###\n';
    getMessagePath(taskId, workerId, timeInMin, function (err, msgPath) {
      if (err)
        return callBack(err)
      msgPath = path.resolve(msgPath + '/' + fileName);
      fs.appendFile(msgPath, message, function (err) {
        if (err) 
          return callBack(err)
        return callBack();
      });
    });
  } else {
    return callBack('Message was empty.');
  }
}
