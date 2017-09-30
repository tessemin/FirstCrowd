'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp');

// a function to make the nested directories
function makeDirectory(dir, callBack) {
  if (!fs.existsSync(dir)) {
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
module.exports.makeDirectory = makeDirectory;

// gets the filePath for the stored messages
module.exports.getFilePath = function(taskId, workerId, timeInMin, callBack) {
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
      return callBack(err);
    return callBack(null, dir);
  });
};
// get directories in a directory
module.exports.getDirectories = function(srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());
};

module.exports.getWorkerMsgFileName = function() {
  return 'workerMessages.txt';
};

module.exports.getRequesterMsgFileName = function() {
  return 'requesterMessages.txt';
};

module.exports.getSubmissionMsgFileName = function() {
  return 'submissionMessages.txt';
};
