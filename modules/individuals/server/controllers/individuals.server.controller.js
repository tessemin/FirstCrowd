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
module.exports.read = function(req, res) {
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
module.exports.update = function(req, res) {
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
module.exports.delete = function(req, res) {
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
module.exports.list = function(req, res) {

};

/**
 * List of Certifications
 */
module.exports.listCertifications = function(req, res) {
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
module.exports.individualByID = function(req, res, next, id) {

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
module.exports.updateCertification = function(req, res) {
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
module.exports.updateEducation = function(req, res) {
  if (req.body && req.body.school) {
    getIndividual(req, res, function(individual) {
      var reqID = null;
      if (req.body.school.hasOwnProperty('_id')) {
        if (req.body.school._id)
          reqID = req.body.school._id.toString();
        delete req.body.school._id;
      }
      var individualUpdated = false;
      if (req.body.delete && reqID) {
        var deleteIndex;
        for (deleteIndex = 0; deleteIndex < individual.schools.length; deleteIndex++) {
          if (individual.schools[deleteIndex]._id.toString() === reqID)
            break;
        }
        if (deleteIndex < individual.schools.length) {
          individual.schools.splice(deleteIndex);
          individualUpdated = true;
        }
      } else if (!req.body.delete) {
        if (reqID) {
          individual.schools = individual.schools.map(function(school) {
            if (school._id.toString() === reqID) {
              individualUpdated = true;
              return req.body.school;
            }
            return school;
          });
        } else {
          individual.schools.push(req.body.school);
          individualUpdated = true;
        }
      }
      var message;
      if (!individualUpdated) {
        message = 'No changes sent!';
        if (req.body.delete)
          message = 'School Deleted Sucessfully!';
        return res.status(200).send({
          individual: individual | null,
          message: message
        });
      }
      individual.save(function (err, individual) {
        if (err) {
          return res.status(422).send({ message: errorHandler.getErrorMessage(err) });
        } else {
          message = 'School Update Sucessful!';
          if (req.body.delete)
            message = 'School Deleted Sucessfully!';
          return res.status(200).send({
            individual: individual,
            message: message
          });
        }
      });
    });
  } else {
    return res.status(200).send({
      message: 'Nothing to Update'
    });
  }
};

/**
 * Individual Skills update
 */
module.exports.updateSkill = function(req, res) {
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

function setJobExperience(individual, jobExps) {
  // transfers skills from work experience to skills
  // this is not version control
  while (individual.jobExperience.length > 0) {
    individual.jobExperience.pop();
  }

  if (jobExps && jobExps.length > 0) {
    jobExps.forEach(function(jobExp) {
      var jobIndex = null;
      if (jobExp._id) {
        individual.skills = individual.skills.reduce(function(skills, skill) {
          if (skill.jobConnection && skill.jobConnection.toString() !== jobExp._id.toString())
            skills.push(skill);
          return skills;
        }, []);
        // for future version control
/*         individual.jobExperience.forEach(function(indJob, index) {
          if (indJob._id.toString() === jobExp._id.toString())
            jobIndex = index;
        }); */
      }
      if (jobExp.skills.trim())
        jobExp.skills = jobExp.skills.split(',');
      if (jobExp.skills && Array.isArray(jobExp.skills)) {
        jobExp.skills = jobExp.skills.map(function(skill) {
          individual.skills.push({
            skill: skill,
            firstUsed: jobExp.startDate,
            lastUsed: jobExp.endDate,
            locationLearned: jobExp.employer,
            jobConnection: jobExp._id
          });
          return individual.skills[individual.skills.length - 1]._id;
        });
      } else {
        jobExp.skills = [];
      }
      if (jobIndex)
        individual.jobExperience[jobIndex] = jobExp;
      else
        individual.jobExperience.push(jobExp);
    });
  }
  return individual;
}

/**
 * Individual Experience update
 */
module.exports.updateExperience = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {

      individual = setJobExperience(individual, req.body);
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
module.exports.updateBio = function(req, res) {
  if (req.body) {
    getIndividual(req, res, function(individual) {
      let user = new User(req.user);
      individual.bio = req.body;
      user = _.extend(user, _.pick(req.body, whitelistedFields));
      if (req.body.firstName || req.body.lastName)
        user.displayName = user.firstName + ' ' + user.lastName;

      req.user = user;

      individual.save(function (err, individual) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        user.save(function (err, user) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.status(200).send({
              user: user,
              individual: individual,
              message: 'Bio updated successfuly!'
            });
          }
        });
      });
    });
  } else {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('Nothing to Update')
    });
  }
};

module.exports.getIndividual = function(req, res) {
  getIndividual(req, res, function(individual) {
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
        jobExperience: [],
        skills: individual.skills
      };
      var experiences = JSON.parse(JSON.stringify(individual.jobExperience));
      experiences = experiences.map(function(exp) {
        var returnSkills = [];
        exp.skills.forEach(function(skill) {
          if (skill)
            individual.skills.forEach(function(trueSkill) {
              if (trueSkill._id && trueSkill._id.toString() === skill.toString())
                returnSkills.push(trueSkill.skill);
            });
        });
        exp.skills = returnSkills;
        return exp;
      });
      safeIndividualObject.jobExperience = experiences;
    }
    res.json(safeIndividualObject || null);
  });
};

/**
 * create an individual
 */
module.exports.create = function(req, res) {

};

module.exports.getThisIndividual = getIndividual;
