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
  
  // ACTIVE TASKS
  app.route('/api/requesters/activeTask/all').post(requesters.activeTask.all);

  // SUSPENDED TASKS
  app.route('/api/requesters/suspendedTask/all').post(requesters.suspendedTask.all);

  // COMPLETED TASKS
  app.route('/api/requesters/completedTask/all').post(requesters.completedTask.all);

  // REJECTED TASKS
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
  app.route('/api/tasks/getTasksWithOptions').post(requesters.taskFindWithOption);
  
  app.route('/api/tasks/payment/create').post(requesters.taskActions.payment.create);
  app.route('/api/tasks/payment/execute').post(requesters.taskActions.payment.execute);
  
  app.route('/api/tasks/preapproval/accept').post(requesters.taskActions.preapproval.accept);
  app.route('/api/tasks/preapproval/reject').post(requesters.biddingActions.rejectBid);
  
  // Bidding
  app.route('/api/tasks/bidding/reject').post(requesters.biddingActions.rejectBid);
  app.route('/api/tasks/bidding/activate').post(requesters.biddingActions.activateBidableTask);
  app.route('/api/tasks/bidding/bidder/info').post(requesters.biddingActions.bidderInfo);
  
  app.route('/api/tasks/bidding/payment/create').post(requesters.biddingActions.payment.create);
  app.route('/api/tasks/bidding/payment/execute').post(requesters.biddingActions.payment.execute);

  // Finish by binding the Requester middleware
  app.param('requesterId', requesters.requesterByID);
};
