'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindOne', 'ownsTask', 'findJobByWorker', 'findBidByWorker', 'sendMessage', 'getRequesterMsgFileName'];
var getUserTypeObject, taskFindOne, ownsTask, findJobByWorker, findBidByWorker, sendMessage, getRequesterMsgFileName;
[getUserTypeObject, taskFindOne, ownsTask, findJobByWorker, findBidByWorker, sendMessage, getRequesterMsgFileName] = moduleDependencies.assignDependantVariables(dependants);

module.exports.setUpRequesterFileExchange = function(req, res, callBack) {
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

      if (!findJobByWorker(task, { _id: req.body.workerId }) && !findBidByWorker(task, { _id: req.body.workerId })) {
        return res.status(422).send({
          message: 'That id is not a worker for this task'
        });
      }
      callBack(typeObj, task);
    });
  });
};

module.exports.sendRequesterMessage = function(message, taskId, workerId, timeInMin, callBack) {
  if (message && message.length > 0) {
    return sendMessage(message, taskId, workerId, timeInMin, getRequesterMsgFileName(), function(err, msg, timeStamp) {
      if (err) return callBack(err);
      callBack(null, { files: [], messages: { requester: msg }, timeStamp: timeStamp });
    });
  } else {
    callBack();
  }
};
