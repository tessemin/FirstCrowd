'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Individual = mongoose.model('Individual'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  coreController = require(path.resolve('./modules/core/server/controllers/core.server.controller')),
  _ = require('lodash'),
  validator = require('validator'),
  superIndividual = null;
  
var whitelistedFields = ['firstName', 'lastName', 'contactPreference', 'email', 'phone', 'username', 'middleName'];
  
/**
 * Find the Individual
 */
var findIndividual = function(req, res, callBack) {
  console.log('trying findIndividual\nreq: ' + JSON.stringify(req, null, ' ') + '\n');
  var individualID = req.user.individual;
  console.log('findIndividual\n');
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
  } else if (!req.user) {
    return res.status(400).send({
      message: 'User is not logged in'
    });
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

  /* Individual.findById(id).populate('user', 'displayName').exec(function (err, individual) {
    if (err) {
      return next(err);
    } else if (!individual) {
      return res.status(404).send({
        message: 'No Individual with that identifier has been found'
      });
    }
    req.individual = individual;
    next();
  }); */
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
//  console.log('Request body in server:\n' + JSON.stringify(req.body, null, ' ') + '\n');
  if (req.body) {
    getIndividual(req, res, function(individual) {
      console.log('got individual?\n' + JSON.stringify(individual) + '\n');
      individual.schools = req.body;
      
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
      let user = new User(req.user);
      individual.bio = req.body;
      user = _.extend(user, _.pick(req.body, whitelistedFields));
      
      req.user = user;
      
      individual.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
      
      user.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          coreController.renderIndex(req, res);
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
  console.log('\n\nIn getindividual 1\n\n');
  getIndividual(req, res, function(individual) {
    console.log('\n\n\n\n\nIn getIndividual\n\n\n\n\n\n\n\n\n');
    var safeIndividualObject = null;
    if (individual) {
      safeIndividualObject = {
        bio: {
          sex: individual.bio.sex,
          dateOfBirth: individual.bio.dateOfBirth,
          profession: individual.bio.profession,
          address: {
            country: individual.bio.address.country,
            zipCode: individual.bio.address.zipCode,
            state: individual.bio.address.state,
            city: individual.bio.address.city,
            streetAddress: individual.bio.address.streetAddress
          }
        },
        schools: individual.schools,
        certification: individual.certification,
        jobExperience: individual.jobExperience,
        skills: individual.skills
      };
    }
    res.json(safeIndividualObject || null);
  });
};

/**
 * create an individual
 */
exports.create = function(req, res) {
  
};
