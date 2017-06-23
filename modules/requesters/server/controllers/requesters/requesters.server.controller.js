'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Requester = mongoose.model('Requester'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

  
exports.getRequesterData = {
  all: function(req, res) {
    
  }
}


/**
 * Requester middleware
 */
exports.requesterByID = function(req, res, next, id) {

  /* if (!mongoose.Types.ObjectId.isValid(id)) {
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
  }); */
  next();
};
