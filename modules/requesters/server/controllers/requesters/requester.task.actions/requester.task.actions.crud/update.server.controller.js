/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
/* var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = [];
var ;
[] = moduleDependencies.assignDependantVariables(dependants); */

// we dont need this code until its better defined
module.exports.update = function(req, res) {
  // needs to modified so that it ony allows for loosening changes
  /* getUserTypeObject(req, res, function(typeObj) {
    if (isRequester(req.user)) {
      taskId = req.body.taskId;
      taskFindOne(taskId, function(err, task) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        if (task.requester.requesterId.toString() === typeObj._id.toString()) {
          // if we are updating the status, make sure we keep the requester and task in same state
          task = _.extend(task, _.pick(req.body, taskWhiteListedFields));
            task.save(function(err) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else if (taskWhiteListedFields.indexOf('status') > -1 && req.body.status) {
                setStatus(req.body.taskId, req.body.status, typeObj, function (message) {
                  if (message.error) {
                    res.status(422).send({
                      message: message.error
                    });
                  }
                  res.status(200).send({
                    message: 'Update successful'
                  });
                });
              } else {
                return res.status(200).send({
                  message: 'Update successful'
                });
              }
            });
        } else {
          return res.status(422).send({
            message: 'You are not the owner of this task'
          });
        }
      });
    } else {
      return res.status(422).send({
        message: 'You are not a requester'
      });
    }
  }); */
};
