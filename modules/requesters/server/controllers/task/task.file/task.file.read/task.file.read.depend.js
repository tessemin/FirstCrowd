'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  _ = require('lodash'),
  fs = require('fs');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getDirectories', 'getRequesterMsgFileName', 'getWorkerMsgFileName', 'getSubmissionMsgFileName', 'getFilePath'];
var getDirectories, getRequesterMsgFileName, getWorkerMsgFileName, getSubmissionMsgFileName, getFilePath;
[getDirectories, getRequesterMsgFileName, getWorkerMsgFileName, getSubmissionMsgFileName, getFilePath] = moduleDependencies.assignDependantVariables(dependants);

// get get the message files for a task after timeX
// afterTimeX can be ommited
// files are stores like ->resources->taskId->workerId->timestamps->worker|requester|submissions
function getFilesInTask(taskDir, forEach, callBack, afterTimeX) {
  // get each subdirectory in the task file path
  var subDirs = getDirectories(taskDir);
  subDirs.sort(function(a, b) {
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
  });
  // for each subdir get the ones after timeX
  for (var sub = 0; sub < subDirs.length && (subDirs[sub] > afterTimeX || !afterTimeX); sub++) {
    // then get each file in those sub dirs
    var timeDir = path.resolve(taskDir + '/' + subDirs[sub]);
    if (fs.existsSync(timeDir)) {
      var timeStampFiles = fs.readdirSync(timeDir);
      var files = [];
      for (var tFile = 0; tFile < timeStampFiles.length; tFile++) {
        if (!fs.lstatSync(path.resolve(timeDir + '/' + timeStampFiles[tFile])).isDirectory())
          files.push({
            name: timeStampFiles[tFile],
            timeStamp: subDirs[sub]
          });
      }
      // get all the messages in that timedirectory
      var messages = {};
      var messagePath = path.resolve(timeDir + '/messages/' + getRequesterMsgFileName());
      if (fs.existsSync(messagePath))
        messages.requester = fs.readFileSync(messagePath, 'utf8');
      messagePath = path.resolve(timeDir + '/messages/' + getWorkerMsgFileName());
      if (fs.existsSync(messagePath))
        messages.worker = fs.readFileSync(messagePath, 'utf8');
      messagePath = path.resolve(timeDir + '/messages/' + getSubmissionMsgFileName());
      if (fs.existsSync(messagePath))
        messages.submission = fs.readFileSync(messagePath, 'utf8');
      forEach(subDirs[sub], files || [], messages || null);
    }
  }
  return callBack();
}
module.exports.getFilesInTask = getFilesInTask;

// get the downloadables for a task, this does not download the files
module.exports.getDownloadables = function(taskId, typeObjId, callBack, afterTimeX) {
  getFilePath(taskId, typeObjId, null, function (err, taskWorkerDir) {
    var files = [];
    getFilesInTask(taskWorkerDir, function(sub, fils, messages) {
      if ((fils && fils.length > 0) || !_.isEmpty(messages))
        files.push({ files: fils, messages: messages, timeStamp: sub });
    }, function () {
      return callBack({ down: files });
    }, afterTimeX);
  });
};

// downoad the blob test for a file
// this actually downloads the file
module.exports.getDownloadFile = function(taskId, typeObjId, filename, timeStamp, callBack) {
  var file = {};
  file.name = filename;
  getFilePath(taskId, typeObjId, timeStamp, function (err, filePath) {
    filePath = file.path = path.resolve(filePath + '/' + filename);
    if (!fs.existsSync(filePath)) {
      callBack('That file doesn\'t exist.');
    }
    var stat = fs.statSync(filePath);
    var fileToSend = fs.readFileSync(filePath);
    return callBack(null, stat, filename, fileToSend);
  });
};
