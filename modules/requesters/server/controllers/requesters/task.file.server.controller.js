'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  fs = require('fs'),
  mkdirp = require('mkdirp');

function makeDirectory(dir, callBack) {
  if (!fs.existsSync(dir)){
    mkdirp(dir, function (err) {
      if (err)
        return callBack(err);
      else
        return callBack();
    });
  } else {
    return callBack();
  }
}

function writeFilesToPath(file, dirPath, callBack, next) {
  fs.readFile(file.path, function (err, data) {
    if (err) {
      return callBack(err);
    }
    var oldPath = file.path;
    // set the correct path for the file not the temporary one from the API:
    file.name = file.name.replace(/ /g, '_');
    dirPath = path.resolve(dirPath);
    file.path = path.resolve(dirPath + '/' + file.name);
    // copy the data from the req.files.file.path and paste it to file.path
    makeDirectory(dirPath, function (err) {
      if (err) return callBack(err);
      fs.access(dirPath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (err) return callBack(err);
        fs.writeFile(file.path, data, function (err) {
          if (err) return callBack(err);
          fs.unlink(oldPath, function (err) {
            if (err) return callBack(err);

            if (next)
              return next(dirPath, callBack, next);
            else
              return callBack();
          });
        });
      });
    });

  });
}

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}

function getTimeInMinutes(milli) {
  var date = null;
  if (milli)
    date = new Date(milli);
  else
    date = new Date();
  return parseInt(((date.getTime())/1000*60), 10).toString();
}

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
  var dir = './resources/taskSubmissions';
  if (taskId) {
    dir += '/taskId_' + taskId.toString();
    if (workerId) {
      dir += '/workerId_' + workerId.toString();
      if (timeInMin && timeInMin > 0)
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


function getFilesInTask(taskDir, forEach, callBack) {
  var subDir = getDirectories(taskDir);
  subDir.sort(function(a, b) {
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
  });
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
      var messages = {};
      var messagePath = path.resolve(subDir + '/messages/' + getRequesterMsgFileName());
      if (fs.existsSync(messagePath))
        messages.requester = fs.readFileSync(messagePath, 'utf8');
      messagePath = path.resolve(subDir + '/messages/' + getWorkerMsgFileName());
      if (fs.existsSync(messagePath))
        messages.worker = fs.readFileSync(messagePath, 'utf8');
      messagePath = path.resolve(subDir + '/messages/' + getSubmissionMsgFileName());
      if (fs.existsSync(messagePath))
        messages.submission = fs.readFileSync(messagePath, 'utf8');
      forEach(sub, files || [], messages || null);
    }
  });
  return callBack();
}

function getDownloadables(taskId, typeObjId, callBack) {
  getFilePath(taskId, typeObjId, null, function (err, taskWorkerDir) {
    var files = [];
    getFilesInTask(taskWorkerDir, function(sub, fils, messages) {
      if ((fils && fils.length > 0) || !_.isEmpty(messages))
        files.push({ files: fils, messages: messages, timeStamp: sub });
    }, function () {
      return callBack({ down: files });
    });
  });
}

function getDownloadFile(taskId, typeObjId, filename, timeStamp, callBack) {
  var file = {};
  file.name = filename;
  getFilePath(taskId, typeObjId, timeStamp, function (err, filePath) {
    filePath = file.path = path.resolve(filePath + '/' + filename);
    if (!fs.existsSync(filePath)) {
      callBack('That file doesn\'t exist.');
    }
    var stat = fs.statSync(filePath);
    var fileToSend = fs.readFileSync(filePath);
    return callBack(null, stat, filename, fileToSend)
  });
}

function sendMessage(message, taskId, workerId, timeInMin, fileName, callBack) {
  if (message) {
    if (!timeInMin)
      timeInMin = getTimeInMinutes();
    message = message + '\n###\n';
    getFilePath(taskId, workerId, timeInMin, function (err, msgPath) {
      if (err)
        return callBack(err)
      var msgDir = path.resolve(msgPath + '/messages/');
      msgPath = path.resolve(msgDir + '/' + fileName);
      makeDirectory(msgDir, function(err) {
        if (err)
          return callBack(err)
        fs.appendFile(msgPath, message, function (err) {
          if (err)
            return callBack(err)
          return callBack(null, message, timeInMin);
        });
      });
    });
  } else {
    return callBack('Message was empty.');
  }
}

exports.getDirectories = getDirectories;
exports.writeFilesToPath = writeFilesToPath;
exports.makeDirectory = makeDirectory;
exports.getTimeInMinutes = getTimeInMinutes;
exports.getWorkerMsgFileName = getWorkerMsgFileName;
exports.getRequesterMsgFileName = getRequesterMsgFileName;
exports.getSubmissionMsgFileName = getSubmissionMsgFileName;
exports.getFilePath = getFilePath;
exports.getFilesInTask = getFilesInTask;
exports.getDownloadables = getDownloadables;
exports.getDownloadFile = getDownloadFile;
exports.sendMessage = sendMessage;
