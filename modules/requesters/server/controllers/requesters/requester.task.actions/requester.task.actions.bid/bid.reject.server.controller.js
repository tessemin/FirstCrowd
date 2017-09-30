'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindOne', 'ownsTask'];
var getUserTypeObject, taskFindOne, ownsTask;
[getUserTypeObject, taskFindOne, ownsTask] = moduleDependencies.assignDependantVariables(dependants);

// rejects any bid including bidable bids and preapproval bids
function rejectBid (req, res) {
  // gey the type object
  getUserTypeObject(req, res, function(typeObj) {
    // get the task
    taskFindOne(req.body.taskId, function (err, task) {
      // check if you own the task
      if (ownsTask(task, typeObj)) {
        // try and match the bid to one in the bids array in the task
        var bidId = req.body.bidId;
        var foundBid = false;
        for (var bid = 0; bid < task.bids.length && bidId; bid++) {
          // if found?
          if (task.bids[bid]._id && task.bids[bid]._id.toString() === bidId.toString()) {
            foundBid = true;
            // when found set status rejected
            task.bids[bid].status = 'rejected';
            // save the task
            task.save(function (err, task) {
              if (err)
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              return res.status(200).send({
                message: 'Bid rejected successfully.'
              });
            });
          }
        }
        // if not found
        if (!foundBid)
          return res.status(422).send({
            message: 'No bid with that Id found.'
          });
      } else {
        return res.status(422).send({
          message: 'You are not the owner of this task'
        });
      }
    });
  });
}

module.exports.rejectBid = rejectBid;
module.exports.rejectPreapproval = rejectBid;
