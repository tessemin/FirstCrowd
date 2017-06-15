'use strict';

/**
 * Module dependencies
 */
var requestersPolicy = require('../policies/requesters.server.policy'),
  requesters = require('../controllers/requesters.server.controller');

module.exports = function(app) {
  // Requesters Routes
  app.route('/api/requesters').all(requestersPolicy.isAllowed)
    .get(requesters.list)
    .post(requesters.create);

  app.route('/api/requesters/:requesterId').all(requestersPolicy.isAllowed)
    .get(requesters.read)
    .put(requesters.update)
    .delete(requesters.delete);

  // Finish by binding the Requester middleware
  app.param('requesterId', requesters.requesterByID);
};
