'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['setUpRequesterFileExchange', 'findJobByWorker', 'findWorkerByWorkerTaskObject', 'removeTaskFromWorkerArray', 'addWorkerTaskWithStatus', 'setTaskStatus', 'sendRequesterMessage'];
var setUpRequesterFileExchange, findJobByWorker, findWorkerByWorkerTaskObject, removeTaskFromWorkerArray, addWorkerTaskWithStatus, setTaskStatus, sendRequesterMessage;
[setUpRequesterFileExchange, findJobByWorker, findWorkerByWorkerTaskObject, removeTaskFromWorkerArray, addWorkerTaskWithStatus, setTaskStatus, sendRequesterMessage] = moduleDependencies.assignDependantVariables(dependants);

// reject the submission
module.exports.reject = function (req, res) {
  // set up the reuqester file exchange
  setUpRequesterFileExchange(req, res, function(typeObj, task) {
    // gets the job index
    var jobIndex = task.jobs.indexOf(findJobByWorker(task, { _id: req.body.workerId }));
    // if the worker is alread in a file state, send a error
    if (task.jobs[jobIndex].status === 'rejected' || task.jobs[jobIndex].status === 'accepted')
      return res.status(422).send({ message: 'That worker is in a final state.' });
    if (task.jobs[jobIndex].status === 'active') // if the worker is active send a error
      return res.status(422).send({ message: 'That worker is still working.' });
    // finds the worker
    findWorkerByWorkerTaskObject(task.jobs[jobIndex].worker, function(err, worker) {
      if (err) {
        return res.status(422).send({
          message: err
        });
      }
      // sets the workers task status
      worker = removeTaskFromWorkerArray(task._id, worker);
      worker = addWorkerTaskWithStatus('fclosed', task._id, worker);
      // sets the job status
      task.jobs[jobIndex].status = 'rejected';
      //save the worker
      worker.save(function(err) {
        if (err)
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        // see if the task status needs to be changed
        setTaskStatus(typeObj, task, function(err, task) {
          if (err)
            return res.status(422).send({
              message: err
            });
          // send a message to the worker
          req.body.message = 'Task Submission Rejected' + ((req.body.message) ? ': ' + req.body.message : '');
          sendRequesterMessage(req.body.message, task._id, req.body.workerId, null, function(err) {
            if (err)
              return res.status(200).send({
                message: 'Submission rejected, but the message was not sent.'
              });
            return res.status(200).send({
              message: 'Submission Rejected.',
              task: task
            });
          });
        });
      });
    });
  });
};
