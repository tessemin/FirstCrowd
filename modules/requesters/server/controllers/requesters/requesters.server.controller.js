'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Requester = mongoose.model('Requester'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Requester
 */
exports.create = function(req, res) {
  var requester = new Requester(req.body);
  requester.user = req.user;

  requester.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(requester);
    }
  });
};

/**
 * Show the current Requester
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var requester = req.requester ? req.requester.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  requester.isCurrentUserOwner = req.user && requester.user && requester.user._id.toString() === req.user._id.toString();

  res.jsonp(requester);
};

/**
 * Update a Requester
 */
exports.update = function(req, res) {
  var requester = req.requester;

  requester = _.extend(requester, req.body);

  requester.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(requester);
    }
  });
};

/**
 * Delete an Requester
 */
exports.delete = function(req, res) {
  var requester = req.requester;

  requester.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(requester);
    }
  });
};

/**
 * List of Requesters
 */
exports.list = function(req, res) {
  Requester.find().sort('-created').populate('user', 'displayName').exec(function(err, requesters) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(requesters);
    }
  });
};

/**
 * Requester middleware
 */
exports.requesterByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Requester is invalid'
    });
  }

  Requester.findById(id).populate('user', 'displayName').exec(function (err, requester) {
    if (err) {
      return next(err);
    } else if (!requester) {
      return res.status(404).send({
        message: 'No Requester with that identifier has been found'
      });
    }
    req.requester = requester;
    next();
  });
};
