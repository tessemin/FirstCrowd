'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');
  
  var payment = require('../controllers/payment.server.controller');

  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  app.route('/api/payment/paypal/create/').post(payment.paypal.create);
  app.route('/api/payment/paypal/execute/').post(payment.paypal.execute);
  
  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/*').get(core.renderIndex);
};
