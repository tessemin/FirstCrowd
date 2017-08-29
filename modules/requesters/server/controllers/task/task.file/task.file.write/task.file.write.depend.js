'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  fs = require('fs');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['makeDirectory', 'getTimeInMinutes', 'getFilePath', 'getSubmissionMsgFileName'];
var makeDirectory, getTimeInMinutes, getFilePath, getSubmissionMsgFileName;
[makeDirectory, getTimeInMinutes, getFilePath, getSubmissionMsgFileName] = moduleDependencies.assignDependantVariables(dependants);

module.exports.writeFilesToPath = function(file, dirPath, callBack, next) {
  fs.readFile(file.path, function (err, data) {
    if (err) {
      return callBack(err);
    }
    var oldPath = file.path;
    // set the correct path for the file not the temporary one from the API:
    file.name = file.name.trim().replace(/ /g, '_');
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
};

function sendMessage(message, taskId, workerId, timeInMin, fileName, callBack) {
  if (message) {
    if (!timeInMin)
      timeInMin = getTimeInMinutes();
    message = message + '\n###\n';
    getFilePath(taskId, workerId, timeInMin, function (err, msgPath) {
      if (err)
        return callBack(err);
      var msgDir = path.resolve(msgPath + '/messages/');
      msgPath = path.resolve(msgDir + '/' + fileName);
      makeDirectory(msgDir, function(err) {
        if (err)
          return callBack(err);
        fs.appendFile(msgPath, message, function (err) {
          if (err)
            return callBack(err);
          return callBack(null, message, timeInMin);
        });
      });
    });
  } else {
    return callBack('Message was empty.');
  }
}
module.exports.sendMessage = sendMessage;


module.exports.sendSubmissionMessage = function(message, taskId, workerId, timeInMin, callBack) {
  if (message && message.length > 0) {
    return sendMessage(message, taskId, workerId, timeInMin, getSubmissionMsgFileName(), function(err, msg, timeStamp) {
      if (err) return callBack(err);
      callBack(null, { files: [], messages: { submission: msg }, timeStamp: timeStamp });
    });
  }
  return callBack(null);
};
