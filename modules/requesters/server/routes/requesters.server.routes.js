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
  app.route('/api/requesters/tasks/all').post(requesters.tasks.all);
  // ACTIVE TASKS
  app.route('/api/requesters/activeTask/update').put(requesters.activeTask.update);
  app.route('/api/requesters/activeTask/all').post(requesters.activeTask.all);
  app.route('/api/requesters/activeTask/add').post(requesters.activeTask.add);

  // SUSPENDED TASKS
  app.route('/api/requesters/suspendedTask/update').put(requesters.suspendedTask.update);
  app.route('/api/requesters/suspendedTask/all').post(requesters.suspendedTask.all);
  app.route('/api/requesters/suspendedTask/add').post(requesters.suspendedTask.add);

  // COMPLETED TASKS
  app.route('/api/requesters/completedTask/update').put(requesters.completedTask.update);
  app.route('/api/requesters/completedTask/all').post(requesters.completedTask.all);
  app.route('/api/requesters/completedTask/add').post(requesters.completedTask.add);

  // REJECTED TASKS
  app.route('/api/requesters/rejectedTask/update').put(requesters.rejectedTask.update);
  app.route('/api/requesters/rejectedTask/all').post(requesters.rejectedTask.all);
  app.route('/api/requesters/rejectedTask/add').post(requesters.rejectedTask.add);

  // RATINGS
  app.route('/api/requesters/workerRating/update').put(requesters.workerRating.update);
  app.route('/api/requesters/workerRating/all').post(requesters.workerRating.all);
  app.route('/api/requesters/workerRating/create').post(requesters.workerRating.create);

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

  // Finish by binding the Requester middleware
  app.param('requesterId', requesters.requesterByID);
};
