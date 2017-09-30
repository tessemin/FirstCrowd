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

// create a new task
module.exports.create = function(req, res) {
  // get your type obj
  getUserTypeObject(req, res, function(typeObj) {
    // user is signed in as requester
    if (isRequester(req.user)) {
      if (req.body.skillsNeeded) {
        req.body.skillsNeeded = req.body.skillsNeeded.split(',');
      }
      // create the task from the reqest body
      var newTask = new Task(req.body);
      // if the user is an enterprise
      if (req.user.enterprise) {
        newTask.requester.requesterType.enterprise = true;
        newTask.requester.requesterId = typeObj._id;
      } else if (req.user.individual) { // else if the are an individual
        newTask.requester.requesterType.individual = true;
        newTask.requester.requesterId = typeObj._id;
      } else {
        return res.status(400).send({
          message: 'You do not have that type access'
        });
      }
      // set the creation date
      newTask.dateCreated = Date.now();
      // add the task to your suspended task list
      typeObj.requester.suspendedTasks = statusPushTo(newTask, typeObj.requester.suspendedTasks);
      // save the type object
      typeObj.save(function (typeErr, typeObj) {
        if (typeErr) {
          return res.status(422).send({
            message: 'Error connecting your profile with task: ' + newTask.title
          });
        } else {
          // save the newTask
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
