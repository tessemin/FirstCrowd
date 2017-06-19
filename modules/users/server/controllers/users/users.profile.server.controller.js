'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  coreController = require(path.resolve('./modules/core/server/controllers/core.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  validator = require('validator');

var whitelistedFields = ['contactPreference', 'email', 'phone', 'username', 'middleName', 'displayName', 'firstName', 'lastName'];
var rollWhitelistedData = ['requester', 'resourceOwner', 'worker'];

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  if (user) {
    // Update whitelisted fields only
    user = _.extend(user, _.pick(req.body, whitelistedFields));

    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Update white listed roles
 */
exports.updateRoles = function (req, res) {
  var user = req.user;
  if (req.body) {
    if (user.roles.indexOf('worker') > -1) {
      user.roles.splice(user.roles.indexOf('worker'), 1);
    }
    if (user.roles.indexOf('requester') > -1) {
      user.roles.splice(user.roles.indexOf('worker'), 1);
    }
    if (user.roles.indexOf('resourceOwner') > -1) {
      user.roles.splice(user.roles.indexOf('worker'), 1);
    }
    if (user) {
      var found = false;
      for (var i = 0; i < rollWhitelistedData.length; i++) {
        if (rollWhitelistedData[i] === req.body.role) {
          user.roles.push(req.body.role);
          user.save(function (err) {
            if (err) {       
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(user);
            }
          });
          found = true;
          break;
        }
      }
      if (!found) {
        return res.status(422).send({
          message: 'Cannot update that to that View'
        });
      }
    } else {
      res.status(401).send({
        message: 'User is not signed in'
      });
    }
  } else {
    return res.status(422).send({
      message: 'No new role specified'
    });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var existingImageUrl;

  // Filtering to upload only images
  var multerConfig = config.uploads.profile.image;
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;
  var upload = multer(multerConfig).single('newProfilePicture');

  if (user) {
    existingImageUrl = user.profileImageURL;
    uploadImage()
      .then(updateUser)
      .then(deleteOldImage)
      .then(login)
      .then(function () {
        res.json(user);
      })
      .catch(function (err) {
        res.status(422).send(err);
      });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function updateUser () {
    return new Promise(function (resolve, reject) {
      user.profileImageURL = config.uploads.profile.image.dest + req.file.filename;
      user.save(function (err, theuser) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  function deleteOldImage () {
    return new Promise(function (resolve, reject) {
      if (existingImageUrl !== User.schema.path('profileImageURL').defaultValue) {
        fs.unlink(existingImageUrl, function (unlinkError) {
          if (unlinkError) {
            console.log(unlinkError);
            reject({
              message: 'Error occurred while deleting old profile picture'
            });
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  function login () {
    return new Promise(function (resolve, reject) {
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          resolve();
        }
      });
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  // Sanitize the user - short term solution. Copied from core.server.controller.js
  // TODO create proper passport mock: See https://gist.github.com/mweibel/5219403
  var safeUserObject = null;
  if (req.user) {
    safeUserObject = {
      userRole: req.user.userRole,
      displayName: req.user.displayName,
      provider: req.user.provider,
      username: req.user.username,
      created: req.user.created.toString,
      roles: req.user.roles,
      profileImageURL: req.user.profileImageURL,
      email: req.user.email,
      phone: req.user.phone,
      contactPreference: req.user.contactPreference,
      lastName: req.user.lastName,
      middleName: req.user.middleName,
      firstName: req.user.firstName,
      additionalProvidersData: req.user.additionalProvidersData
    };
    if (req.user.enterprise) {
      safeUserObject.enterprise = req.user.enterprise;
    }
    if (req.user.individual) {
      safeUserObject.individual = req.user.individual;
    }
  }
  res.json(safeUserObject || null);
};
