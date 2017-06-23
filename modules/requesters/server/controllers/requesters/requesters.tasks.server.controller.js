'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Requester = mongoose.model('Requester'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  individualControler = require(path.resolve('./modules/individuals/server/controllers/individuals.server.controller')),
  enterpriseControler = require(path.resolve('./modules/enterprises/server/controllers/enterprises.server.controller')),
  _ = require('lodash');

exports.activeTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
}

exports.suspendedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
}

exports.completedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
}

exports.rejectedTask = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
}

exports.workerRating = {
  update: function (req, res) {
    
  },
  all: function (req, res) {
    
  },
  add: function (req, res) {
    
  }
}