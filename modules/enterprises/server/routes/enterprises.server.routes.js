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
  
  app.route('/enterprises/api/enterprises/partners/getCustomers/').post(enterprises.partners.getCustomers);
  app.route('/enterprises/api/enterprises/partners/getSuppliers/').post(enterprises.partners.getSuppliers);
  app.route('/enterprises/api/enterprises/partners/getCompetitors/').post(enterprises.partners.getCompetitors);
  
  app.route('/enterprises/api/enterprises/catalog/getProducts/').post(enterprises.catalog.getProducts);
  app.route('/enterprises/api/enterprises/catalog/getServices/').post(enterprises.catalog.getServices);
  
  app.route('/enterprises/api/enterprises/getDemands/').post(enterprises.getDemands);
  
  app.route('/enterprises/api/enterprises/setupEnterpriseGraph/').post(enterprises.setupEnterpriseGraph);
  
  app.route('/enterprises/api/enterprises/fuzzyEntepriseQuery/').post(enterprises.fuzzyEntepriseQuery);

  // Finish by binding the Enterprise middleware
  app.param('enterpriseId', enterprises.enterpriseByID);
};
