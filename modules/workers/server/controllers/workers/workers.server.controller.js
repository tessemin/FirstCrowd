'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Worker = mongoose.model('Worker'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Worker
 */
exports.create = function(req, res) {
  var worker = new Worker(req.body);
  worker.user = req.user;

  worker.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(worker);
    }
  });
};

/**
 * Show the current Worker
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var worker = req.worker ? req.worker.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  worker.isCurrentUserOwner = req.user && worker.user && worker.user._id.toString() === req.user._id.toString();

  res.jsonp(worker);
};

/**
 * Update a Worker
 */
exports.update = function(req, res) {
  var worker = req.worker;

  worker = _.extend(worker, req.body);

  worker.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(worker);
    }
  });
};

/**
 * Delete an Worker
 */
exports.delete = function(req, res) {
  var worker = req.worker;

  worker.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(worker);
    }
  });
};

/**
 * List of Workers
 */
exports.list = function(req, res) {
  Worker.find().sort('-created').populate('user', 'displayName').exec(function(err, workers) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workers);
    }
  });
};

/**
 * Worker middleware
 */
exports.workerByID = function(req, res, next, id) {
/* 
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Worker is invalid'
    });
  }

  Worker.findById(id).populate('user', 'displayName').exec(function (err, worker) {
    if (err) {
      return next(err);
    } else if (!worker) {
      return res.status(404).send({
        message: 'No Worker with that identifier has been found'
      });
    }
    req.worker = worker;
    next();
  }); */
  next();
};
