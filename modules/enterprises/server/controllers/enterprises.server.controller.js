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

// gets the enterprises partners
exports.getEnterprisePartners = function(req, res) {
  Enterprise.findById(req.body.enterpriseId, function (err, enterprise) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!enterprise) {
      return res.status(422).send({
        message: 'No Enterprise with that identifier has been found'
      });
    } else {
      return res.status(200).send(enterprise.partners);
    }
  });
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

exports.setupEnterpriseGraph = function(req, res) {
  getEnterprise(req, res, function (myEnterprise) {
    var entConnect = [];
    for (var numEnts = getRandomNumber(30, 100); numEnts > 0; numEnts--) {
      entConnect.push(makeNewEnterprise(req.user._id));
    }
    entConnect.push(myEnterprise);
    for (var onThisEnt = 0; onThisEnt < entConnect.length; onThisEnt++) {
      var thisEnt = entConnect[onThisEnt];
      var stillCanCon = [];
      var random = null;
      for (var i = 0; i < entConnect.length; i++)
        stillCanCon.push({ ent: entConnect[i], canCon: true });
      for (var sup = getRandomNumber(1, 5); sup >= 0; sup--) {
        random = getRandomNumber(0, stillCanCon.length - 1);
        while (!stillCanCon[random].canCon && stillCanCon[random].ent._id.toString() !== thisEnt._id.toString())
          random = getRandomNumber(0, stillCanCon.length - 1);
        thisEnt.partners.supplier.push({
          companyName: stillCanCon[random].ent.profile.companyName,
          URL: stillCanCon[random].ent.profile.URL,
          enterpriseId: stillCanCon[random].ent._id
        });
        stillCanCon[random].canCon = false;
      }
      for (var cus = getRandomNumber(1, 5); cus >= 0; cus--) {
        random = getRandomNumber(0, stillCanCon.length - 1);
        while (!stillCanCon[random].canCon && stillCanCon[random].ent._id.toString() !== thisEnt._id.toString())
          random = getRandomNumber(0, stillCanCon.length - 1);
        thisEnt.partners.customer.push({
          companyName: stillCanCon[random].ent.profile.companyName,
          URL: stillCanCon[random].ent.profile.URL,
          enterpriseId: stillCanCon[random].ent._id
        });
        stillCanCon[random].canCon = false;
      }
      for (var com = getRandomNumber(1, 5); com >= 0; com--) {
        random = getRandomNumber(0, stillCanCon.length - 1);
        while (!stillCanCon[random].canCon && stillCanCon[random].ent._id.toString() !== thisEnt._id.toString())
          random = getRandomNumber(0, stillCanCon.length - 1);
        thisEnt.partners.competitor.push({
          companyName: stillCanCon[random].ent.profile.companyName,
          URL: stillCanCon[random].ent.profile.URL,
          enterpriseId: stillCanCon[random].ent._id
        });
        stillCanCon[random].canCon = false;
      }
    }
    recurseSaveEnts(entConnect, res);
  });
};

function recurseSaveEnts(entArray, res, errors) {
  if (entArray.length > 0) {
    (entArray.pop()).save(function (err, ent) {
      if (err) {
        if (!errors)
          errors = [];
        errors.push(err);
      }
      if (ent)
        console.log(JSON.stringify(ent.partners, null, 1) + '\n');
      return recurseSaveEnts(entArray, res, errors);
    });
  } else {
    console.log(errors);
    return res.status(200).send(errors);
  }
}

function makeNewEnterprise(userId) {
  var ent = new Enterprise({
    user: userId,
    profile: {
      countryOfBusiness: 'US',
      companyAddress: {}
    },
    partners: {
      supplier: [],
      customer: [],
      competitor: []
    }
  });
  ent.profile.companyName = generateRandomString(10);
  ent.profile.URL = 'www.' + generateRandomString(8) + '.com';
  ent.profile.description = 'This is the description of ' + ent.profile.companyName;
  ent.profile.yearEstablished = getRandomNumber(1950, 2017);
  ent.profile.employeeCount = getRandomNumber(1, 10000);
  ent.profile.companyAddress.country = 'US';
  ent.profile.companyAddress.streetAddress = generateRandomString(5) + ' Rd';
  ent.profile.companyAddress.city = generateRandomString(5) + 'burg';
  ent.profile.companyAddress.state = 'IL';
  ent.profile.companyAddress.zipCode = getRandomNumber(100000, 999999);
  return ent;
}

function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomString(length) {
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz';

  for (var i = 0; i < length; i++)
    text += possible.charAt(getRandomNumber(0, possible.length - 1));
  return text;
}

exports.getThisEnterprise = getEnterprise;
