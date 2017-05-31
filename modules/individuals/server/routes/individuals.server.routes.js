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
  
  app.route('/individuals/api/individuals/education/').post(individuals.updateEducation);
  
  app.route('/individuals/api/individuals/skills/').post(individuals.updateSkill);
  
  app.route('/individuals/api/individuals/experiences/').post(individuals.updateExperience);
  
  app.route('/individuals/api/individuals/bio/').post(individuals.updateBio);
  
  app.route('/individuals/api/individuals/listCertifications/').post(individuals.listCertifications);
  
  app.route('/individuals/api/individuals/getIndividual/').get(individuals.getIndividual);

  // Finish by binding the Individual middleware
  app.param('individualId', individuals.individualByID);
};
