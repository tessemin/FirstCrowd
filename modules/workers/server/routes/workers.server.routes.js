'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var workersPolicy = require('../policies/workers.server.policy'),
  workers = require('../controllers/workers.server.controller'), 
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller'));

// Requires multiparty 
var multiparty = require('connect-multiparty'),
  multipartyMiddleware = multiparty();

module.exports = function(app) {

  // ACTIVE TASKS
  app.route('/api/workers/activeTask/update').post(workers.activeTask.update);
  app.route('/api/workers/activeTask/all').post(workers.activeTask.all);

  // REJECTED TASKS
  app.route('/api/workers/rejectedTask/all').post(workers.rejectedTask.all); // .all(workersPolicy.isAllowed)

  // COMPLETED TASKS
  app.route('/api/workers/completedTask/all').post(workers.completedTask.all);

  // INACTIVE TASKS
  app.route('/api/workers/inactiveTask/all').post(workers.inactiveTask.all);

  // RECOMENDED TASKS
  app.route('/api/workers/recomendedTask/all').post(workers.recomendedTask.all);

  // WORKER ACTIONS
  app.route('/api/workers/task/take').post(workers.takeTask);
  // submit a task file
  app.post('/api/workers/task/file/submit', multipartyMiddleware, workers.taskFiles.submitTaskFiles);
  app.post('/api/workers/task/file/getDownloadables', workers.taskFiles.getDownloadables);
  app.post('/api/workers/task/file/download', workers.taskFiles.downloadTaskFile);
  app.post('/api/workers/task/file/sendMessage', workers.taskFiles.sendMessage);
  app.post('/api/workers/task/markCompleted').post(workers.markTaskCompleted);
  
  // TASKS NATIVE API
  app.route('/api/getAllTasks/open').post(workers.getAllOpenTasks);
  app.route('/api/getOneTask').post(workers.getOneTask);
  app.route('/api/getTasksWithOptions').post(workers.getTasksWithOptions);

  app.route('/api/task/getYourWorker').post(workers.getWorkerForTask);
  
  // search tasks
  app.route('/api/workers/tasks/search/myTasks').post(taskSearch.searchTasks.searchMyTasks);
  app.route('/api/workers/tasks/search/openTasks').post(taskSearch.searchTasks.searchOpenTasks);

  // Finish by binding the Worker middleware
  app.param('taskId', workers.taskByID);
};
