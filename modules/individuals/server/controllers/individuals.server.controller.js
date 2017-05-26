'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Individual
 */
exports.create = function(req, res) {
  var individual = new Individual(req.body);
  individual.user = req.user;
  individual.bio.firstName = req.user.firstName;
  individual.bio.lastName = req.user.lastName;

  individual.save(function(err) {
    if (err) {
      console.log(err);
      return;
 //     return res.status(400).send({
  //      message: errorHandler.getErrorMessage(err)
   //   });
    } else {
      res.jsonp(individual);
    }
  });
};

/**
 * Show the current Individual
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var individual = req.individual ? req.individual.toJSON() : {};


  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  individual.isCurrentUserOwner = req.user && individual.user && individual.user._id.toString() === req.user._id.toString();

  res.jsonp(individual);
};

/**
 * Update a Individual
 */
exports.update = function(req, res) {
  var individual = req.individual;

  individual = _.extend(individual, req.body);
  
  req.user.firstName = individual.bio.firstName;
  req.user.lastName = individual.bio.lastName;

  individual.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(individual);
    }
  });
};

/**
 * Delete an Individual
 */
exports.delete = function(req, res) {
  var individual = req.individual;

  individual.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(individual);
    }
  });
};

/**
 * List of Individuals
 */
exports.list = function(req, res) {
  Individual.find().sort('-created').populate('user', 'displayName').exec(function(err, individuals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(individuals);
    }
  });
};

/**
 * Individual middleware
 */
exports.individualByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Individual is invalid'
    });
  }

  Individual.findById(id).populate('user', 'displayName').exec(function (err, individual) {
    if (err) {
      return next(err);
    } else if (!individual) {
      return res.status(404).send({
        message: 'No Individual with that identifier has been found'
      });
    }
    req.individual = individual;
    next();
  });
};
