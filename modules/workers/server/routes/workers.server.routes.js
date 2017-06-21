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
    
  app.route('/api/workers/activeTasks/').all(workersPolicy.isAllowed)
    .get(workers.activeTasks.read)
    .post(workers.activeTasks.create);
    
  app.route('/api/workers/activeTask/:taskId').all(workersPolicy.isAllowed)
    .get(workers.activeTask.read)
    .put(workers.activeTask.update)
    .delete(workers.activeTask.delete);
    
  app.route('/api/workers/rejectedTasks/').all(workersPolicy.isAllowed)
    .get(workers.rejectedTasks.read)
    .post(workers.rejectedTasks.create);
    
  app.route('/api/workers/rejectedTask/:taskId').all(workersPolicy.isAllowed)
    .get(workers.rejectedTask.read)
    .put(workers.rejectedTask.update)
    .delete(workers.rejectedTask.delete);
  
  app.route('/api/workers/completedTasks/').all(workersPolicy.isAllowed)
    .get(workers.completedTasks.read)
    .post(workers.completedTasks.create);
    
  app.route('/api/workers/completedTask/:taskId').all(workersPolicy.isAllowed)
    .get(workers.completedTask.read)
    .put(workers.completedTask.update)
    .delete(workers.completedTask.delete);
    
  app.route('/api/workers/inactiveTasks/').all(workersPolicy.isAllowed)
    .get(workers.inactiveTasks.read)
    .post(workers.inactiveTasks.create);
    
  app.route('/api/workers/inactiveTask/:taskId').all(workersPolicy.isAllowed)
    .get(workers.inactiveTask.read)
    .put(workers.inactiveTask.update)
    .delete(workers.inactiveTask.delete);
    
  app.route('/api/workers/recomendedTasks/').all(workersPolicy.isAllowed)
    .get(workers.recomendedTasks.read);
    
  app.route('/api/workers/recomendedTask/:taskId').all(workersPolicy.isAllowed)
    .get(workers.recomendedTask.read)
    .put(workers.recomendedTask.update)
    .delete(workers.recomendedTask.delete);

  // Finish by binding the Worker middleware
  app.param('workerId', workers.workerByID);
  
  app.param('taskId', workers.taskByID);
};
