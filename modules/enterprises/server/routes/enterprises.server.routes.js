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
    
  app.route('/enterprises/api/enterprises/profile/').post(enterprises.updateProfile);
  
  app.route('/enterprises/api/enterprises/suppliers/').post(enterprises.updateSuppliers);
  
  app.route('/enterprises/api/enterprises/competitors/').post(enterprises.updateCompetitors);
  
  app.route('/enterprises/api/enterprises/customers/').post(enterprises.updateCustomers);
  
  app.route('/enterprises/api/enterprises/getEnterprise/').get(enterprises.getEnterprise);

  // Finish by binding the Enterprise middleware
  app.param('enterpriseId', enterprises.enterpriseByID);
};
