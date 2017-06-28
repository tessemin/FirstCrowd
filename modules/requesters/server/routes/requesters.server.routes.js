'use strict';

/**
 * Module dependencies
 */
var requestersPolicy = require('../policies/requesters.server.policy'),
  requesters = require('../controllers/requesters.server.controller');

module.exports = function(app) {
  /*
   * REQUESTER TABLE
   */
  // ALL REQUESTER TASKS
  app.route('/api/requesters/tasks/all').post(requesters.requesterTasks.all);
  app.route('/api/requesters/tasks/changeStatus').post(requesters.requesterTasks.changeStatus);
  
  // ACTIVE TASKS
  app.route('/api/requesters/activeTask/update').put(requesters.activeTask.update);
  app.route('/api/requesters/activeTask/all').post(requesters.activeTask.all);

  // SUSPENDED TASKS
  app.route('/api/requesters/suspendedTask/update').put(requesters.suspendedTask.update);
  app.route('/api/requesters/suspendedTask/all').post(requesters.suspendedTask.all);

  // COMPLETED TASKS
  app.route('/api/requesters/completedTask/update').put(requesters.completedTask.update);
  app.route('/api/requesters/completedTask/all').post(requesters.completedTask.all);

  // REJECTED TASKS
  app.route('/api/requesters/rejectedTask/update').put(requesters.rejectedTask.update);
  app.route('/api/requesters/rejectedTask/all').post(requesters.rejectedTask.all);

  // RATINGS
  app.route('/api/requesters/workerRating/makeRating').put(requesters.workerRating.makeRating);
  app.route('/api/requesters/workerRating/all').post(requesters.workerRating.all);
  app.route('/api/requesters/workerRating/delete').post(requesters.workerRating.delete);

  // REQUESTER INFORMATION
  app.route('/api/requesters/getRequesterData').post(requesters.getRequesterData.all);
  app.route('/api/requesters/getRequesterRatings').post(requesters.getRequesterData.ratings);

  /*
   * TASK TABLE
   */
  // TASK ACTIONS
  app.route('/api/tasks/createTask').post(requesters.taskActions.create);
  app.route('/api/tasks/deleteTask').post(requesters.taskActions.delete);
  app.route('/api/tasks/updateTask').put(requesters.taskActions.update);
  app.route('/api/tasks/getWorkerRatingsForTask').put(requesters.taskActions.getWorkerRatingsForTask);
  app.route('/api/tasks/getRequesterRatingsForTask').put(requesters.taskActions.getRequesterRatingsForTask);

  // Finish by binding the Requester middleware
  app.param('requesterId', requesters.requesterByID);
};
