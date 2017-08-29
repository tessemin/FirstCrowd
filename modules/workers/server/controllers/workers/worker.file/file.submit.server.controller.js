'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpWorkerFileExchange', 'youAreActiveOnTask', 'getTimeInMinutes', 'getFilePath', 'writeFilesToPath', 'sendSubmissionMessage'];
var setUpWorkerFileExchange, youAreActiveOnTask, getTimeInMinutes, getFilePath, writeFilesToPath, sendSubmissionMessage;
[setUpWorkerFileExchange, youAreActiveOnTask, getTimeInMinutes, getFilePath, writeFilesToPath, sendSubmissionMessage] = moduleDependencies.assignDependantVariables(dependants);
  
module.exports.submitTaskFiles = function(req, res) {
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
};  
