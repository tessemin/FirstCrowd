'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  individualControler = require(path.resolve('./modules/individuals/server/controllers/individuals.server.controller')),
  enterpriseControler = require(path.resolve('./modules/enterprises/server/controllers/enterprises.server.controller')),
  _ = require('lodash');

function getIdsInArray(array) {
  var idArray = [];
  for (var i = 0; i < array.length; i++)
    if (array[i])
      if (array[i].taskId)
        idArray.push(array[i].taskId);
  return idArray;
}

function isRequester(user) {
  if (user.userRole)
    if (user.userRole.indexOf('requester') > -1)
      return true;
  return false;
}

function isWorker(user) {
  if (user.userRole)
    if (user.userRole.indexOf('worker') > -1)
      return true;
  return false;
}

function getUserTypeObject(req, res, callBack) {
  if (req.user) {
    if (req.user.individual) {
      individualControler.getThisIndividual(req, res, callBack);
    } else if (req.user.enterprise) {
      enterpriseControler.getThisEnterprise(req, res, callBack);
    } else {
      return res.status(422).send({
        message: 'User has no valid Type'
      });
    }
  } else {
    return res.status(400).send({
      message: 'User is not signed in, please sign in.',
      link: '/',
      linkMessage: 'Navigate Home'
    });
  }
}
  
exports.isRequester = isRequester;

exports.isWorker = isWorker;

exports.getIdsInArray = getIdsInArray;

exports.getUserTypeObject = getUserTypeObject;
