'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  Enterprise = mongoose.model('Enterprise'),
  Individual = mongoose.model('Individual'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// decalre dependant functions
var moduleDependencies = require(path.resolve('./modules/core/server/controllers/modules.depend.server.controller'));
var dependants = ['getUserTypeObject', 'taskFindOne', 'ownsTask', 'getMongoIndividuals', 'getMongoEnterprises', 'getNestedProperties', 'hashObjId', 'getAllRequesterTasks', 'getRequesterTasks'];
var getUserTypeObject, taskFindOne, ownsTask, getMongoIndividuals, getMongoEnterprises, getNestedProperties, hashObjId, getAllRequesterTasks, getRequesterTasks;
[getUserTypeObject, taskFindOne, ownsTask, getMongoIndividuals, getMongoEnterprises, getNestedProperties, hashObjId, getAllRequesterTasks, getRequesterTasks] = moduleDependencies.assignDependantVariables(dependants);

  
var individualWhiteListFields = ['_id', 'schools', 'jobExperience', 'certification', 'tools', 'specialities', 'skills', 'worker.requesterRatingsPerCategory', 'worker.acceptanceRatesPerCategory', 'worker.acceptanceRate', 'worker.averageCompletionTime', 'worker.preferedCategories'],
  enterpriseWhiteListFields = ['_id', 'profile.companyName', 'profile.yearEstablished', 'profile.classifications', 'profile.description', 'specialities', 'catalog', 'worker.requesterRatingsPerCategory', 'worker.acceptanceRatesPerCategory', 'worker.acceptanceRate', 'worker.averageCompletionTime', 'worker.preferedCategories'];

module.exports.read = {
  bidderInfo: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function (err, task) {
        if (err) {
          return res.status(422).send({
            message: err
          });
        }
        if (ownsTask(task, typeObj)) {
          var indBiddersIds = [],
            entBiddersIds = [];
          for (var bid = 0; bid < task.bids.length; bid++) {
            if (task.bids[bid].worker.workerType.enterprise && !task.bids[bid].worker.workerType.individual) {
              entBiddersIds.push(task.bids[bid].worker.workerId);
            } else if (task.bids[bid].worker.workerType.individual && !task.bids[bid].worker.workerType.enterprise) {
              indBiddersIds.push(task.bids[bid].worker.workerId);
            } else {
              indBiddersIds.push(task.bids[bid].worker.workerId);
              entBiddersIds.push(task.bids[bid].worker.workerId);
            }
          }
          getMongoIndividuals(indBiddersIds, function (err, individuals) {
            if (err)
              return res.status(422).send({
                message: err
              });
            getMongoEnterprises(entBiddersIds, function (err, enterprises) {
              if (err)
                return res.status(422).send({
                  message: err
                });
              var safeInds = individuals.map(function(ind) {
                ind = getNestedProperties(ind, individualWhiteListFields);
                ind.displayId = hashObjId(ind._id);
                return ind;
              });
              var safeEnts = enterprises.map(function(ent) {
                ent = getNestedProperties(ent, enterpriseWhiteListFields);
                ent.displayId = hashObjId(ent._id);
                return ent;
              });
              res.json({ individuals: safeInds, enterprises: safeEnts });
            });
          });
        } else {
          return res.status(422).send({
            message: 'You are not the owner of this task'
          });
        }
      });
    });
  },
  getAllMyTasks: function (req, res) {
    getAllRequesterTasks(req, res, function (tasks) {
      return res.json({ tasks: tasks });
    });
  },
  getMyActiveTasks: function (req, res) {
    getRequesterTasks(req, res, 'active');
  },
  getMySuspendedTasks: function (req, res) {
    getRequesterTasks(req, res, 'suspended');
  },
  getMyCompletedTasks: function (req, res) {
    getRequesterTasks(req, res, 'completed');
  },
  getMyRejectedTasks: function (req, res) {
    getRequesterTasks(req, res, 'rejected');
  }
};
