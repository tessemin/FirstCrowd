'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var workersPolicy = require('../policies/workers.server.policy'),
  workers = require('../controllers/workers.includes'),
  task = require(path.resolve('./modules/requesters/server/controllers/task.includes'));

// Requires multiparty 
var multiparty = require('connect-multiparty'),
  multipartyMiddleware = multiparty();

module.exports = function(app) {
  // ACTIVE TASKS
  app.route('/api/workers/activeTask/update').post(workers.crud.updateProgress);
  app.route('/api/workers/activeTask/all').post(workers.crud.getActiveTasks);
  app.route('/api/workers/activeTask/quit').post(workers.job.quitTask);

  // REJECTED TASKS
  app.route('/api/workers/rejectedTask/all').post(workers.crud.getRejectedTasks); // .all(workersPolicy.isAllowed)

  // COMPLETED TASKS
  app.route('/api/workers/completedTask/all').post(workers.crud.getCompletedTasks);

  // INACTIVE TASKS
  app.route('/api/workers/inactiveTask/all').post(workers.crud.getInactiveTasks);

  // RECOMENDED TASKS
  app.route('/api/workers/recomendedTask/all').post(workers.crud.getRecomendedTasks);

  // WORKER ACTIONS
  app.route('/api/workers/task/take').post(workers.job.takeTask);
  // submit a task file
  app.post('/api/workers/task/file/submit', multipartyMiddleware, workers.file.submitTaskFiles);
  app.post('/api/workers/task/file/getDownloadables', workers.file.getWorkerDownloadables);
  app.post('/api/workers/task/file/download', workers.file.downloadTaskFile);
  app.post('/api/workers/task/file/sendMessage', workers.file.sendMessage);
  app.route('/api/workers/task/markCompleted').post(workers.job.markTaskCompleted);
  
  // TASKS NATIVE API
  app.route('/api/getAllTasks/open').post(task.search.getAllOpenTasks);

  app.route('/api/task/getYourWorker').post(workers.crud.getWorkerForTask);
  
  // search tasks
  app.route('/api/workers/tasks/search/myTasks').post(task.search.searchMyTasks);
  app.route('/api/workers/tasks/search/openTasks').post(task.search.searchOpenTasks);

  // Finish by binding the Worker middleware
  app.param('taskId', workers.taskByID);
};

workers.taskByID = function(req, res, next, id) {
  next();
};

