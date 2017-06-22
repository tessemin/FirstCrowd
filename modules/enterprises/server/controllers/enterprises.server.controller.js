'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Enterprise = mongoose.model('Enterprise'),
  User = mongoose.model('User'),
  passport = require('passport'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  coreController = require(path.resolve('./modules/core/server/controllers/core.server.controller')),
  _ = require('lodash'),
  validator = require('validator'),
  superEnterprise = null;

var whitelistedFields = ['contactPreference', 'email', 'phone', 'username', 'middleName', 'displayName'];

/**
 * Find the Enterprise
 */
var findEnterprise = function(req, res, callBack) {
  var enterpriseID = req.user.enterprise;

  Enterprise.findById(enterpriseID, function (err, enterprise) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!enterprise) {
      return res.status(404).send({
        message: 'No Enterprise with that identifier has been found'
      });
    } else {
      superEnterprise = enterprise;
      callBack(superEnterprise);
    }
  });
};

/**
 * Get the Enterprise
 */
var getEnterprise = function(req, res, callBack) {
  if (!superEnterprise) {
    findEnterprise(req, res, callBack);
  } else if (!req.user) {
    return res.status(400).send({
      message: 'User is not logged in'
    });
  } else if (superEnterprise.id !== req.user.enterprise) {
    if (!mongoose.Types.ObjectId.isValid(req.user.enterprise)) {
      return res.status(400).send({
        message: 'User is an invalid Enterprise'
      });
    }
    findEnterprise(req, res, callBack);
  } else {
    callBack(superEnterprise);
  }
};

/**
 * Create a Enterprise
 */
exports.create = function(req, res) {
  /* var enterprise = new Enterprise(req.body);
  enterprise.user = req.user;

  // todo add display name as company name

  enterprise.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(enterprise);
    }
  }); */
};

/**
 * Show the current Enterprise
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var enterprise = req.enterprise ? req.enterprise.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  enterprise.isCurrentUserOwner = req.user && enterprise.user && enterprise.user._id.toString() === req.user._id.toString();

  res.jsonp(enterprise);
};

/**
 * Update a Enterprise
 */
exports.update = function(req, res) {
  /* var enterprise = req.enterprise;

  enterprise = _.extend(enterprise, req.body);

  enterprise.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(enterprise);
    }
  }); */
};

/**
 * Delete an Enterprise
 */
exports.delete = function(req, res) {
  /* var enterprise = req.enterprise;

  enterprise.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(enterprise);
    }
  }); */
};

/**
 * List of Enterprises
 */
exports.list = function(req, res) {
/*   Enterprise.find().sort('-created').populate('user', 'displayName').exec(function(err, enterprises) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(enterprises);
    }
  }); */
};

/**
 * Enterprise middleware
 */
exports.enterpriseByID = function(req, res, next, id) {

  /* Enterprise.findById(id).populate('user', 'displayName').exec(function (err, enterprise) {
   if (err) {
   return next(err);
   } else if (!enterprise) {
   return res.status(404).send({
   message: 'No Enterprise with that identifier has been found'
   });
   }
   req.enterprise = enterprise;
   next();
   }); */
};

/**
 * update Enterprise Profile
 */
exports.updateProfile = function(req, res) {
  if (req.body) {
    getEnterprise(req, res, function (enterprise) {
      
      req.user.displayName = req.body.profile.companyName;
      
      var user = new User(req.user);
      
      user = _.extend(user, _.pick(req.body, whitelistedFields));
      req.user = user;
      
      delete req.body.email;
      delete req.body.phone;
      enterprise.profile = req.body.profile;

      enterprise.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          user.save(function (err) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              coreController.renderIndex(req, res);
            }
          });
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
 * update Enterprise Suppliers
 */
exports.updateSuppliers = function(req, res) {
  if (req.body) {
    getEnterprise(req, res, function (enterprise) {
      if (req.body._id) { // update
        if (enterprise.partners.supplier) {
          var brakeout = false;
          for (var index = 0; index < enterprise.partners.supplier.length && !brakeout; index++) {
            if (enterprise.partners.supplier[index]._id.toString() === req.body._id.toString()) {
              if (req.body.URL === '' && req.body.companyName === '') {
                enterprise.partners.supplier.splice(index, 1);
              } else {
                enterprise.partners.supplier[index] = req.body;
              }
              brakeout = true;
            }
          }
          if (!brakeout) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage('No enterprise suppliers with that ID found')
            });
          }
        } else {
          return res.status(422).send({
            message: errorHandler.getErrorMessage('No enterprise suppliers, can\'t find by ID')
          });
        }
      } else { // make new Suppliers
        if (enterprise.partners.supplier) { // supplier is not empty
          delete req.body._id;
          enterprise.partners.supplier[enterprise.partners.supplier.length] = req.body;
        } else { // supplier is empty
          delete req.body._id;
          enterprise.partners.supplier[0] = req.body;
        }
      }
      enterprise.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(enterprise);
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
 * update Enterprise Competitors
 */
exports.updateCompetitors = function(req, res) {
  if (req.body) {
    getEnterprise(req, res, function (enterprise) {
      if (req.body._id) { // update
        if (enterprise.partners.competitor) {
          var brakeout = false;
          for (var index = 0; index < enterprise.partners.competitor.length && !brakeout; index++) {
            if (enterprise.partners.competitor[index]._id.toString() === req.body._id.toString()) {
              if (req.body.URL === '' && req.body.companyName === '') {
                enterprise.partners.competitor.splice(index, 1);
              } else {
                enterprise.partners.competitor[index] = req.body;
              }
              brakeout = true;
            }
          }
          if (!brakeout) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage('No enterprise competitors with that ID found')
            });
          }
        } else {
          return res.status(422).send({
            message: errorHandler.getErrorMessage('No enterprise competitors, can\'t find by ID')
          });
        }
      } else { // make new Competitors
        if (enterprise.partners.competitor) { // competitor is not empty
          delete req.body._id;
          enterprise.partners.competitor[enterprise.partners.competitor.length] = req.body;
        } else { // competitor is empty
          delete req.body._id;
          enterprise.partners.competitor[0] = req.body;
        }
      }
      enterprise.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(enterprise);
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
 * update Enterprise Customers
 */
exports.updateCustomers = function(req, res) {
  if (req.body) {
    getEnterprise(req, res, function (enterprise) {
      if (req.body._id) { // update
        if (enterprise.partners.customer) {
          var brakeout = false;
          for (var index = 0; index < enterprise.partners.customer.length && !brakeout; index++) {
            if (enterprise.partners.customer[index]._id.toString() === req.body._id.toString()) {
              if (req.body.URL === '' && req.body.companyName === '') { // delete
                enterprise.partners.customer.splice(index, 1);
              } else { // update
                enterprise.partners.customer[index] = req.body;
              }
              brakeout = true;
            }
          }
          if (!brakeout) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage('No enterprise customers with that ID found')
            });
          }
        } else {
          return res.status(422).send({
            message: errorHandler.getErrorMessage('No enterprise customers, can\'t find by ID')
          });
        }
      } else { // make new Competitors
        if (enterprise.partners.customer) { // customer is not empty
          delete req.body._id;
          enterprise.partners.customer[enterprise.partners.customer.length] = req.body;
        } else { // customersis empty
          delete req.body._id;
          enterprise.partners.customer[0] = req.body;
        }
      }
      enterprise.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(enterprise);
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
 * get Enterprise object
 */
exports.getEnterprise = function(req, res) {
  getEnterprise(req, res, function (enterprise) {
    var safeEnterpriseObject = null;
    if (enterprise) {
      safeEnterpriseObject = {
        _id: enterprise._id,
        profile: {
          companyName: enterprise.profile.companyName,
          URL: enterprise.profile.URL,
          countryOfBusiness: enterprise.profile.countryOfBusiness,
          description: enterprise.profile.description,
          classifications: enterprise.profile.classifications,
          yearEstablished: enterprise.profile.yearEstablished,
          employeeCount: enterprise.profile.employeeCount,
          companyAddress: {
            country: enterprise.profile.companyAddress.country,
            streetAddress: enterprise.profile.companyAddress.streetAddress,
            city: enterprise.profile.companyAddress.city,
            state: enterprise.profile.companyAddress.state,
            zipCode: enterprise.profile.companyAddress.zipCode
          }
        },
        partners: {
          supplier: enterprise.partners.supplier,
          customer: enterprise.partners.customer,
          competitor: enterprise.partners.competitor
        }
      };
    }
    res.json(safeEnterpriseObject || null);
  });
};

exports.findEnterprise = findEnterprise;
