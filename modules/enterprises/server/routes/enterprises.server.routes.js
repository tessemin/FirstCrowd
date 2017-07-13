'use strict';

/**
 * Module dependencies
 */
var enterprisesPolicy = require('../policies/enterprises.server.policy'),
  enterprises = require('../controllers/enterprises.server.controller');

module.exports = function(app) {
    
  app.route('/enterprises/api/enterprises/profile/').post(enterprises.updateProfile);
  
  app.route('/enterprises/api/enterprises/suppliers/').post(enterprises.updateSuppliers);
  
  app.route('/enterprises/api/enterprises/competitors/').post(enterprises.updateCompetitors);
  
  app.route('/enterprises/api/enterprises/customers/').post(enterprises.updateCustomers);
  
  app.route('/enterprises/api/enterprises/getEnterprise/').get(enterprises.getEnterprise);
  
  app.route('/enterprises/api/enterprises/getEnterprisePartners/').post(enterprises.getEnterprisePartners);
  
  app.route('/enterprises/api/enterprises/setupEnterpriseGraph/').post(enterprises.setupEnterpriseGraph);

  // Finish by binding the Enterprise middleware
  app.param('enterpriseId', enterprises.enterpriseByID);
};
