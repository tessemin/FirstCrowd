'use strict';

/**
 * Module dependencies
 */
var enterprisesPolicy = require('../policies/enterprises.server.policy'),
  enterprises = require('../controllers/enterprises.server.controller');

module.exports = function(app) {
  // Enterprises Routes
  app.route('/api/enterprises').all(enterprisesPolicy.isAllowed)
    .get(enterprises.list)
    .post(enterprises.create);

  app.route('/api/enterprises/:enterpriseId').all(enterprisesPolicy.isAllowed)
    .get(enterprises.read)
    .put(enterprises.update)
    .delete(enterprises.delete);

  // Finish by binding the Enterprise middleware
  app.param('enterpriseId', enterprises.enterpriseByID);
};
