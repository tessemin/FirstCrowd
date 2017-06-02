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
    
var whitelistedFields = ['contactPreference', 'email', 'phone', 'username', 'middleName'];

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
  var enterprise = new Enterprise(req.body);
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
  });
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
  var enterprise = req.enterprise;

  enterprise = _.extend(enterprise, req.body);

  enterprise.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(enterprise);
    }
  });
};

/**
 * Delete an Enterprise
 */
exports.delete = function(req, res) {
  var enterprise = req.enterprise;

  enterprise.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(enterprise);
    }
  });
};

/**
 * List of Enterprises
 */
exports.list = function(req, res) {
  Enterprise.find().sort('-created').populate('user', 'displayName').exec(function(err, enterprises) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(enterprises);
    }
  });
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
              if (req.bod.URL === null && req.bod.companyName === null) {
                enterprise.partners.supplier[index] = null;
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
      } else { // make new Competitors
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
              if (req.bod.URL === null && req.bod.companyName === null) {
                enterprise.partners.competitor[index] = null;
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
              if (req.bod.URL === null && req.bod.companyName === null) {
                enterprise.partners.customer[index] = null;
              } else {
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
          enterprise.partners.customer[enterprise.partners.competitor.length] = req.body;
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
        profile: {
          companyName: enterprise.profile.companyName,
          URL: enterprise.profile.URL,
          countryOfBusiness: enterprise.profile.countryOfBusiness,
          description: enterprise.profile.description,
          industryClassification: enterprise.profile.classification,
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
          supplier: [],
          customer: [],
          competitor: []
        }
      };
      if (enterprise.partners.supplier) {
        for (var supply = 0; supply < enterprise.partners.supplier.length; supply++) {
          if (enterprise.partners.supplier[supply]) {
            safeEnterpriseObject.partners.supplier[supply] = new Object();
            safeEnterpriseObject.partners.supplier[supply]._id = enterprise.partners.supplier[supply]._id;
            safeEnterpriseObject.partners.supplier[supply].companyName = enterprise.partners.supplier[supply].companyName;
            safeEnterpriseObject.partners.supplier[supply].URL = enterprise.partners.supplier[supply].URL;
          }
        }
      }
      if (enterprise.partners.customer) {
        for (var cust = 0; cust < enterprise.partners.customer.length; cust++) {
          if (enterprise.partners.customer[cust]) {
            safeEnterpriseObject.partners.customer[cust] = new Object();
            safeEnterpriseObject.partners.customer[cust]._id = enterprise.partners.customer[cust]._id;
            safeEnterpriseObject.partners.customer[cust].companyName = enterprise.partners.customer[cust].companyName;
            safeEnterpriseObject.partners.customer[cust].URL = enterprise.partners.customer[cust].URL;
          }
        }
      }
      if (enterprise.partners.competitor) {
        for (var comp = 0; comp < enterprise.partners.competitor.length; comp++) {
          if (enterprise.partners.competitor[comp]) {
            safeEnterpriseObject.partners.competitor[comp] = new Object();
            safeEnterpriseObject.partners.competitor[comp]._id = enterprise.partners.competitor[comp]._id;
            safeEnterpriseObject.partners.competitor[comp].companyName = enterprise.partners.competitor[comp].companyName;
            safeEnterpriseObject.partners.competitor[comp].URL = enterprise.partners.competitor[comp].URL;
          }
        }
      }
    }
    res.json(safeEnterpriseObject || null);
  });
};
