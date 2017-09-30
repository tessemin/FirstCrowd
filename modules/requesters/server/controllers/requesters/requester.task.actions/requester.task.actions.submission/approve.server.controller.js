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

// approve a submission
// TODO: pay a worker after approval
module.exports.approve = function (req, res) {
  // set up the requester file exchange
  setUpRequesterFileExchange(req, res, function(typeObj, task) {
    // find the job index
    var jobIndex = task.jobs.indexOf(findJobByWorker(task, { _id: req.body.workerId }));
    // if they have already been approved send an error
    if (task.jobs[jobIndex].status === 'rejected' || task.jobs[jobIndex].status === 'accepted')
      return res.status(422).send({ message: 'That worker is in a final state.' });
    if (task.jobs[jobIndex].status === 'active') // if they haven't submitted send an error
      return res.status(422).send({ message: 'That worker is still working.' });
    // find the worker object
    findWorkerByWorkerTaskObject(task.jobs[jobIndex].worker, function(err, worker) {
      if (err) {
        return res.status(422).send({
          message: err
        });
      }
      // set the worker to successfully closed
      worker = removeTaskFromWorkerArray(task._id, worker);
      worker = addWorkerTaskWithStatus('sclosed', task._id, worker);
      // set the jobs status to accepted
      task.jobs[jobIndex].status = 'accepted';
      // save the worker
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
          req.body.message = 'Task Submission Accepted' + ((req.body.message) ? ': ' + req.body.message : '');
          sendRequesterMessage(req.body.message, task._id, req.body.workerId, null, function(err) {
            if (err)
              return res.status(200).send({
                message: 'Submission approved, but the message was not sent.'
              });
            return res.status(200).send({
              message: 'Submission Approved!',
              task: task
            });
          });
        });
      });
    });
  });
};
