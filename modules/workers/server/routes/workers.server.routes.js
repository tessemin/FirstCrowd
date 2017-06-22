'use strict';

/**
 * Module dependencies
 */
var workersPolicy = require('../policies/workers.server.policy'),
  workers = require('../controllers/workers.server.controller');
  
  

module.exports = function(app) {
  // Workers Routes
/*   app.route('/api/workers').all(workersPolicy.isAllowed)
    .get(workers.list)
    .post(workers.create); */

  app.route('/api/workers/:workerId')
    .get(workers.read)
    .put(workers.update)
    .delete(workers.delete);
  
  // ACTIVE TASKS
    
  app.route('/api/workers/activeTask/')
    .post(workers.activeTask.read)
    .put(workers.activeTask.update)
    .delete(workers.activeTask.delete);
    
  app.route('/api/workers/activeTask/all').post(workers.activeTask.all);
  
  app.route('/api/workers/activeTask/create').post(workers.activeTask.create);
  
  // REJECTED TASKS
    
  app.route('/api/workers/rejectedTask/')
    .post(workers.rejectedTask.read)
    .put(workers.rejectedTask.update)
    .delete(workers.rejectedTask.delete);
    
  app.route('/api/workers/rejectedTask/all').post(workers.rejectedTask.all);
  
  app.route('/api/workers/rejectedTask/create').post(workers.rejectedTask.create);//.all(workersPolicy.isAllowed)
  
  // COMPLETED TASKS
  
  app.route('/api/workers/completedTask/')
    .post(workers.completedTask.read)
    .put(workers.completedTask.update)
    .delete(workers.completedTask.delete);
    
  app.route('/api/workers/completedTask/all').post(workers.completedTask.all);
  
  app.route('/api/workers/completedTask/create').post(workers.completedTask.create);
  
  // INACTIVE TASKS
  
  app.route('/api/workers/inactiveTask/')
    .post(workers.inactiveTask.read)
    .put(workers.inactiveTask.update)
    .delete(workers.inactiveTask.delete);
    
  app.route('/api/workers/inactiveTask/all').post(workers.inactiveTask.all);
  
  app.route('/api/workers/inactiveTask/create').post(workers.inactiveTask.create);
    
  // RECOMENDED TASKS  
    
  app.route('/api/workers/recomendedTask/')
    .post(workers.recomendedTask.read)
    .put(workers.recomendedTask.update)
    .delete(workers.recomendedTask.delete);
    
  app.route('/api/workers/recomendedTask/all').post(workers.recomendedTask.all);


  // Finish by binding the Worker middleware
  app.param('workerId', workers.workerByID);
  
  app.param('taskId', workers.taskByID);
};
