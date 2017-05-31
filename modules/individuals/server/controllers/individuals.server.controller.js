'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  superIndividual = null;
  
/**
 * Find the Individual
 */
var findIndividual = function(req, res, callBack) {
  var individualID = req.user.individual;

  Individual.findById(individualID, function (err, individual) { 
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!individual) {
      return res.status(404).send({
        message: 'No Individual with that identifier has been found'
      });
    } else {
      superIndividual = individual;
      callBack(superIndividual);
    }
  });
};

/**
 * Get the Individual
 */
var getIndividual = function(req, res, callBack) {
  if (!superIndividual) {
    findIndividual(req, res, callBack);
  } else if (superIndividual.id !== req.user.individual) {
    if (!mongoose.Types.ObjectId.isValid(req.user.individual)) {
      return res.status(400).send({
        message: 'User is an invalid Individual'
      });
    }
    findIndividual(req, res, callBack);
  } else {
    callBack(superIndividual);
  }
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
 * List of Certifications
 */
exports.listCertifications = function(req, res) {
  getIndividual(req, res, function(individual) {
    if (individual.certification) {
      res.jsonp(individual.certification);
    } else {
      res(null);
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

/**
 * Individual certification update
 */
exports.updateCertification = function(req, res) {
  getIndividual(req, res, function(individual) {
    individual.certification = req.body;
    if (!individual.save()) {
      res.status(400).send({
        message: 'Individual Is Not Changed'
      });
    }
    res.jsonp(individual);
  });
};

/**
 * Individual Education update
 */
exports.updateEducation = function(req, res) {
  getIndividual(req, res, function(individual) {
    for (var i in req.body) {
      if (req.body[i]) {
        req.body[i].address.schoolCountryCode = req.body[i].address.schoolCountry.code;
        req.body[i].address.schoolCountry = req.body[i].address.schoolCountry.name;
      }
    }
    individual.degrees = req.body;
    if (!individual.save()) {
      res.status(400).send({
        message: 'Individual Is Not Changed'
      });
    }
    res.jsonp(individual);
  });
};

/**
 * Individual Skills update
 */
exports.updateSkill = function(req, res) {
  getIndividual(req, res, function(individual) {
    for (var i in req.body) {
      if (req.body[i].locationLearned) {
        req.body[i].locationLearned = req.body[i].locationLearned.split(',');
      }
    }
    individual.skills = req.body;
    if (!individual.save()) {
      res.status(400).send({
        message: 'Individual Is Not Changed'
      });
    }
    res.jsonp(individual);
  });
};

/**
 * Individual Experience update
 */
exports.updateExperience = function(req, res) {
  getIndividual(req, res, function(individual) {
    for (var i in req.body) {
      if (req.body[i].skills) {
        req.body[i].skills = req.body[i].skills.split(',');
      }
    }
    individual.jobExperience = req.body;
    if (!individual.save()) {
      res.status(400).send({
        message: 'Individual Is Not Changed'
      });
    }
    res.jsonp(individual);
  });
}

/**
 * Individual Bio update
 */
exports.updateBio = function(req, res) {
  getIndividual(req, res, function(individual) {
    req.body.address.countryCode = req.body.address.country.code;
    req.body.address.country = req.body.address.country.name;
    individual.bio = req.body;
    req.user.firstName = req.body.firstName;
    req.user.middleName = req.body.middleName;
    req.user.lastName = req.body.lastName;
    req.user.displayName = req.body.firstName + " " + req.body.lastName;
    if (!individual.save()) {
      res.status(400).send({
        message: 'Individual Is Not Changed'
      });
    }
    if (!req.user.save()) {
      res.status(400).send({
        message: 'Cannot Change User'
      });
    }
    res.jsonp(individual);
  });
}

/**
 * create and individual
 */
exports.create = function(req, res) {
  
};
