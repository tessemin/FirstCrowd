'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  individualControler = require(path.resolve('./modules/individuals/server/controllers/individuals.server.controller')),
  enterpriseControler = require(path.resolve('./modules/enterprises/server/controllers/enterprises.server.controller')),
  _ = require('lodash');

// these functions are used mainly with task actions
module.exports.getUserTypeObject = function(req, res, callBack) {
  if (req.user) {
    // gets the user and decides if it is a indeividual or enterprise
    // then uses the individual module or enterprise module to get the proper object
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
    // else return a 404 with a link to the home page
    return res.status(400).send({
      message: 'User is not signed in, please sign in.',
      link: '/',
      linkMessage: 'Navigate Home'
    });
  }
};
