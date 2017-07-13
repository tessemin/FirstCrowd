'use strict';

/**
 * Module dependencies
 */
var workersPolicy = require('../policies/workers.server.policy'),
  workers = require('../controllers/workers.server.controller');


module.exports = function(app) {

  // ACTIVE TASKS
  app.route('/api/workers/activeTask/update').post(workers.activeTask.update);
  app.route('/api/workers/activeTask/all').post(workers.activeTask.all);

  // REJECTED TASKS
  app.route('/api/workers/rejectedTask/').put(workers.rejectedTask.update);
  app.route('/api/workers/rejectedTask/all').post(workers.rejectedTask.all); // .all(workersPolicy.isAllowed)

  // COMPLETED TASKS
  app.route('/api/workers/completedTask/').put(workers.completedTask.update);
  app.route('/api/workers/completedTask/all').post(workers.completedTask.all);

  // INACTIVE TASKS
  app.route('/api/workers/inactiveTask/').put(workers.inactiveTask.update);
  app.route('/api/workers/inactiveTask/all').post(workers.inactiveTask.all);

  // RECOMENDED TASKS
  app.route('/api/workers/recomendedTask/').put(workers.recomendedTask.update);
  app.route('/api/workers/recomendedTask/all').post(workers.recomendedTask.all);

  // WORKER ACTIONS
  app.route('/api/workers/takeTask/').post(workers.takeTask);

  // TASKS NATIVE API
  app.route('/api/getAllTasks/open').post(workers.getAllOpenTasks);
  app.route('/api/getOneTask').post(workers.getOneTask);
  app.route('/api/getTasksWithOptions').post(workers.getTasksWithOptions);

  app.route('/api/task/getYourWorker').post(workers.getWorkerForTask);

  // Finish by binding the Worker middleware
  app.param('taskId', workers.taskByID);
};
