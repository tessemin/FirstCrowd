'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpRequesterFileExchange', 'findJobByWorker', 'sendRequesterMessage'];
var setUpRequesterFileExchange, findJobByWorker, sendRequesterMessage;
[setUpRequesterFileExchange, findJobByWorker, sendRequesterMessage] = moduleDependencies.assignDependantVariables(dependants);

// let a worker retry a task
module.exports.retry = function (req, res) {
  // set up the requester file exchange
  setUpRequesterFileExchange(req, res, function(typeObj, task) {
    // get the job index
    var jobIndex = task.jobs.indexOf(findJobByWorker(task, { _id: req.body.workerId }));
    // if worker is in a file state send an error
    if (task.jobs[jobIndex].status === 'rejected' || task.jobs[jobIndex].status === 'accepted')
      return res.status(422).send({ message: 'That worker is in a final state.' });
    if (task.jobs[jobIndex].status === 'active') // if worker has no submitted send a error
      return res.status(422).send({ message: 'That worker is still working.' });
    // set the job status to active
    task.jobs[jobIndex].status = 'active';
    // save the task
    task.save(function(err, task) {
      if (err)
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      // send a message to the worker
      req.body.message = 'Submission Rejected, Task Owner Approved Retry' + ((req.body.message) ? ': ' + req.body.message : '');
      sendRequesterMessage(req.body.message, task._id, req.body.workerId, null, function(err) {
        if (err)
          return res.status(200).send({
            message: 'Retry approved, but the message was not sent.'
          });
        return res.status(200).send({
          message: 'Retry approved!',
          task: task
        });
      });
    });
  });
};
