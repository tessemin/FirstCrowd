'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'isRequester', 'statusPushTo'];
var getUserTypeObject, isRequester, statusPushTo;
[getUserTypeObject, isRequester, statusPushTo] = moduleDependencies.assignDependantVariables(dependants);

module.exports.create = function(req, res) {
  getUserTypeObject(req, res, function(typeObj) {
    // user is signed in a requester
    if (isRequester(req.user)) {
      if (req.body.skillsNeeded) {
        req.body.skillsNeeded = req.body.skillsNeeded.split(',');
      }
      var newTask = new Task(req.body);
      if (req.user.enterprise) {
        newTask.requester.requesterType.enterprise = true;
        newTask.requester.requesterId = typeObj._id;
      } else if (req.user.individual) {
        newTask.requester.requesterType.individual = true;
        newTask.requester.requesterId = typeObj._id;
      } else {
        return res.status(400).send({
          message: 'You do not have that type access'
        });
      }
      newTask.dateCreated = Date.now();
      typeObj.requester.suspendedTasks = statusPushTo(newTask, typeObj.requester.suspendedTasks);
      typeObj.save(function (typeErr, typeObj) {
        if (typeErr) {
          return res.status(422).send({
            message: 'Error connecting your profile with task: ' + newTask.title
          });
        } else {
          newTask.save(function (err, task) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              return res.status(200).send({
                taskId: task._id,
                message: 'New task: ' + task.title + ' created successfully'
              });
            }
          });
        }
      });
    } else {
      return res.status(422).send({
        message: 'You are not a requester'
      });
    }
  });
};
