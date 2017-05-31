'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Individual = mongoose.model('Individual'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  validator = require('validator'),
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
  if (req.body) {
    getIndividual(req, res, function(individual) {
      individual.certification = req.body;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

/**
 * Individual Education update
 */
exports.updateEducation = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      for (var i in req.body) {
        if (req.body[i]) {
          req.body[i].address.schoolCountryCode = req.body[i].address.schoolCountry.code;
          req.body[i].address.schoolCountry = req.body[i].address.schoolCountry.name;
        }
      }
      individual.degrees = req.body;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
            message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

/**
 * Individual Skills update
 */
exports.updateSkill = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      for (var i in req.body) {
        if (req.body[i].locationLearned) {
          req.body[i].locationLearned = req.body[i].locationLearned.split(',');
        }
      }
      individual.skills = req.body;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
            message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

/**
 * Individual Experience update
 */
exports.updateExperience = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      for (var i in req.body) {
        if (req.body[i].skills) {
          req.body[i].skills = req.body[i].skills.split(',');
        }
      }
      individual.jobExperience = req.body;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

/**
 * Individual Bio update
 */
exports.updateBio = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      req.body.address.countryCode = req.body.address.country.code;
      req.body.address.country = req.body.address.country.name;
      individual.bio = req.body;
      req.user.firstName = req.body.firstName;
      req.user.middleName = req.body.middleName;
      req.user.lastName = req.body.lastName;
      req.user.displayName = req.body.firstName + ' ' + req.body.lastName;
      
      user.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(individual);
        }
      });
    });
  } else {
    return res.status(422).send({
            message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

exports.getIndividual = function(req, res) {
  getIndividual(req, res, function(individual) {
    var safeIndividualObject = null;
    if (individual) {
      safeIndividualObject = {
        bio: {
          sex: individual.bio.sex,
          dateOfBirth: individual.bio.dateOfBirth,
          profession: validator.escape(individual.bio.profession),
          address: {
            country: validator.escape(individual.bio.address.country),
            countryCode: validator.escape(individual.bio.address.countryCode),
            zipCode: individual.bio.address.zipCode,
            state: validator.escape(individual.bio.address.state),
            city: validator.escape(individual.bio.address.city),
            streetAddress: validator.escape(individual.bio.address.streetAddress)
          }
        }
      };
      for (var degree = 0; degree < individual.degrees.length; degree++) {
        if (individual.degrees[degree]) {
          safeIndividualObject.degrees[degree].schoolName = validator.escape(individual.degrees[degree].schoolName);
          safeIndividualObject.degrees[degree].degreeLevel = validator.escape(individual.degrees[degree].degreeLevel);
          safeIndividualObject.degrees[degree].startDate = individual.degrees[degree].startDate;
          safeIndividualObject.degrees[degree].endDate = individual.degrees[degree].endDate;
          safeIndividualObject.degrees[degree].concentration = validator.escape(individual.degrees[degree].concentration);
          safeIndividualObject.degrees[degree].address.schoolCountry = validator.escape(individual.degrees[degree].address.schoolCountry);
          safeIndividualObject.degrees[degree].address.schoolCountryCode = validator.escape(individual.degrees[degree].address.schoolCountryCode);
          safeIndividualObject.degrees[degree].address.schoolStreetAddress = validator.escape(individual.degrees[degree].address.schoolStreetAddress);
          safeIndividualObject.degrees[degree].address.schoolCity = validator.escape(individual.degrees[degree].address.schoolCity);
          safeIndividualObject.degrees[degree].address.schoolState = validator.escape(individual.degrees[degree].address.schoolState);
          safeIndividualObject.degrees[degree].address.schoolZipCode = individual.degrees[degree].address.schoolZipCode;
        }
      }
      for (var exp = 0; exp < individual.jobExperience.length; exp++) {
        if (individual.jobExperience[exp]) {
          safeIndividualObject.jobExperience[exp].employer = validator.escape(individual.jobExperience[exp].employer);
          safeIndividualObject.jobExperience[exp].description = validator.escape(individual.jobExperience[exp].description);
          safeIndividualObject.jobExperience[exp].jobTitle = validator.escape(individual.jobExperience[exp].jobTitle);
          safeIndividualObject.jobExperience[exp].startDate = individual.jobExperience[exp].startDate;
          safeIndividualObject.jobExperience[exp].endDate = individual.jobExperience[exp].endDate;
          for (var skil in individual.jobExperience[exp].skills) {
            if (individual.jobExperience[exp].skills[skil]) {
              safeIndividualObject.jobExperience[exp].skills[skil] = validator.escape(individual.jobExperience[exp].skills[skil]);
            }
          }
        }
      }
      for (var cert = 0; cert < individual.certification.length; cert++) {
        if (individual.certification[cert]) {
          safeIndividualObject.certification[cert].certificationName = validator.escape(individual.certification[cert].certificationName);
          safeIndividualObject.certification[cert].institution = validator.escape(individual.certification[cert].institution);
          safeIndividualObject.certification[cert].dateIssued = individual.certification[cert].dateIssued;
          safeIndividualObject.certification[cert].dateExpired = individual.certification[cert].dateExpired;
          safeIndividualObject.certification[cert].description = validator.escape(individual.certification[cert].description);
        }
      }
      for (var skill = 0; skill < individual.skills.length; skill++) {
        if (individual.skills[skill]) {
          safeIndividualObject.skills[skill].skill = validator.escape(individual.skills[skill].skill);
          safeIndividualObject.skills[skill].firstUsed = individual.skills[skill].firstUsed;
          safeIndividualObject.skills[skill].lastUsed = individual.skills[skill].lastUsed;
          for (var loc in individual.skills[skill].locationLearned) {
            if (individual.skills[skill].locationLearned[loc]) {
              safeIndividualObject.skills[skill].locationLearned[loc] = validator.escape(individual.skills[skill].locationLearned[loc]);
            }
          }
        }
      }
    }
    res.json(safeIndividualObject || null);
  });
};

/**
 * create an individual
 */
exports.create = function(req, res) {
  
};
