'use strict';

/**
 * Module dependencies
 */
var individualPolicy = require('../policies/individual.server.policy'),
  individual = require('../controllers/individual.server.controller');

module.exports = function (app) {
  // Individual collection routes
  app.route('/api/individual').all(individualPolicy.isAllowed)
    .get(individual.list)
    .post(individual.create);

  // Single individual routes
  app.route('/api/individual/:individualId').all(individualPolicy.isAllowed)
    .get(individual.read)
    .put(individual.update)
    .delete(individual.delete);

  // Finish by binding the individual middleware
  app.param('individualId', individual.individualByID);
};
