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

module.exports.reject = function (req, res) {
  setUpRequesterFileExchange(req, res, function(typeObj, task) {
    var jobIndex = task.jobs.indexOf(findJobByWorker(task, { _id: req.body.workerId }));
    if (task.jobs[jobIndex].status === 'rejected' || task.jobs[jobIndex].status === 'accepted')
      return res.status(422).send({ message: 'That worker is in a final state.' });
    if (task.jobs[jobIndex].status === 'active')
      return res.status(422).send({ message: 'That worker is still working.' }); 
    findWorkerByWorkerTaskObject(task.jobs[jobIndex].worker, function(err, worker) {
      if (err) {
        return res.status(422).send({
          message: err
        }); 
      }
      worker = removeTaskFromWorkerArray(task._id, worker);
      worker = addWorkerTaskWithStatus('fclosed', task._id, worker);
      task.jobs[jobIndex].status = 'rejected';
      
      worker.save(function(err) {
        if (err)
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          }); 
        setTaskStatus(typeObj, task, function(err, task) {
          if (err)
            return res.status(422).send({
              message: err
            });
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
