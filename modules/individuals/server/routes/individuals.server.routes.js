'use strict';

/**
 * Module dependencies
 */
var individualsPolicy = require('../policies/individuals.server.policy'),
  individuals = require('../controllers/individuals.server.controller');

module.exports = function(app) {
  // Individuals Routes
  app.route('/api/individuals').all(individualsPolicy.isAllowed)
    .get(individuals.list)
    .post(individuals.create);

  app.route('/api/individuals/:individualId').all(individualsPolicy.isAllowed)
    .get(individuals.read)
    .put(individuals.update)
    .delete(individuals.delete);
    
  app.route('/individuals/api/individuals/certifications/').post(individuals.updateCertification);

  // Finish by binding the Individual middleware
  app.param('individualId', individuals.individualByID);
};
