'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an individual
 */
exports.create = function (req, res) {
  var individual = new Individual(req.body);
  individual.user = req.user;

  individual.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(individual);
    }
  });
};

/**
 * Show the current individual
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var individual = req.individual ? req.individual.toJSON() : {};

  // Add a custom field to the Individual, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Individual model.
  individual.isCurrentUserOwner = !!(req.user && individual.user && individual.user._id.toString() === req.user._id.toString());

  res.json(individual);
};

/**
 * Update an individual
 */
exports.update = function (req, res) {
  var individual = req.individual;

  individual.title = req.body.title;
  individual.content = req.body.content;

  individual.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(individual);
    }
  });
};

/**
 * Delete an individual
 */
exports.delete = function (req, res) {
  var individual = req.individual;

  individual.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(individual);
    }
  });
};

/**
 * List of Individual
 */
exports.list = function (req, res) {
  Individual.find().sort('-created').populate('user', 'displayName').exec(function (err, individual) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(individual);
    }
  });
};

/**
 * Individual middleware
 */
exports.individualByID = function (req, res, next, id) {

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
        message: 'No individual with that identifier has been found'
      });
    }
    req.individual = individual;
    next();
  });
};
