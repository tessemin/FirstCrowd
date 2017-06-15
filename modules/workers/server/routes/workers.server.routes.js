'use strict';

/**
 * Module dependencies
 */
var workersPolicy = require('../policies/workers.server.policy'),
  workers = require('../controllers/workers.server.controller');

module.exports = function(app) {
  // Workers Routes
  app.route('/api/workers').all(workersPolicy.isAllowed)
    .get(workers.list)
    .post(workers.create);

  app.route('/api/workers/:workerId').all(workersPolicy.isAllowed)
    .get(workers.read)
    .put(workers.update)
    .delete(workers.delete);

  // Finish by binding the Worker middleware
  app.param('workerId', workers.workerByID);
};
