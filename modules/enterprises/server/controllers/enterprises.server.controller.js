'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Enterprise = mongoose.model('Enterprise'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  validator = require('validator'),
  superEnterprise = null;
  
/**
 * Find the Enterprise
 */
var findEnterprise = function(req, res, callBack) {
  var individualID = req.user.enterprise;

  Enterprise.findById(individualID, function (err, enterprise) { 
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Enterprise is invalid'
    });
  }

  Enterprise.findById(id).populate('user', 'displayName').exec(function (err, enterprise) {
    if (err) {
      return next(err);
    } else if (!enterprise) {
      return res.status(404).send({
        message: 'No Enterprise with that identifier has been found'
      });
    }
    req.enterprise = enterprise;
    next();
  });
};

/**
 * update Enterprise Profile
 */
exports.updateProfile = function(req, res) {
  console.log('hiiiiiiiiiiiiiiiiiiii');
  if (req.body) {
    getEnterprise(req, res, function (enterprise) {
      console.log(req.body);
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
 * update Enterprise Suppliers
 */
exports.updateSuppliers = function(req, res) {
  if (req.body) {
    getEnterprise(req, res, function (enterprise) {
      console.log(req.body);
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
      console.log(req.body);
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
      console.log(req.body);
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
