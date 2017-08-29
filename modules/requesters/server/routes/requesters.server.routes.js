'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var requestersPolicy = require('../policies/requesters.server.policy'),
  requesters = require('../controllers/requesters.includes'),
  task = require('../controllers/task.includes');

module.exports = function(app) {
  /*
   * REQUESTER TABLE
   */
  // ALL REQUESTER TASKS
  app.route('/api/requesters/tasks/all').post(requesters.taskCRUD.read.getAllMyTasks);

  // ACTIVE TASKS
  app.route('/api/requesters/activeTask/all').post(requesters.taskCRUD.read.getMyActiveTasks);

  // SUSPENDED TASKS
  app.route('/api/requesters/suspendedTask/all').post(requesters.taskCRUD.read.getMySuspendedTasks);

  // COMPLETED TASKS
  app.route('/api/requesters/completedTask/all').post(requesters.taskCRUD.read.getMyCompletedTasks);

  // REJECTED TASKS
  app.route('/api/requesters/rejectedTask/all').post(requesters.taskCRUD.read.getMyRejectedTasks);
  
  app.route('/api/tasks/completion/reject').post(requesters.submission.reject);
  app.route('/api/tasks/completion/approve').post(requesters.submission.approve);
  app.route('/api/tasks/completion/retry').post(requesters.submission.retry);

  // RATINGS
  app.route('/api/requesters/workerRating/makeRating').put(requesters.ratings.createRating);
  app.route('/api/requesters/workerRating/all').post(requesters.ratings.getWorkerRatingsForTask);

  // file
  app.post('/api/requesters/task/file/download', requesters.file.downloadTaskFile);
  app.post('/api/requesters/task/file/sendMessage', requesters.file.sendMessage);
  app.post('/api/requesters/task/file/getDownloadables', requesters.file.getRequesterDownloadables);

  // REQUESTER INFORMATION
  app.route('/api/requesters/getRequesterRatings').post(requesters.ratings.getRequesterRatingsForTask);

  app.route('/api/requesters/search/myTasks').post(task.search.searchMyTasks);

  /*
   * TASK TABLE
   */
  // TASK ACTIONS
  app.route('/api/tasks/createTask').post(requesters.taskCRUD.create);
  app.route('/api/tasks/deleteTask').post(requesters.taskCRUD.delete);
  app.route('/api/tasks/updateTask').put(requesters.taskCRUD.update);
  
  app.route('/api/tasks/payment/create').post(requesters.status.activateTask.create);
  app.route('/api/tasks/payment/execute').post(requesters.status.activateTask.execute);

  app.route('/api/tasks/preapproval/accept').post(requesters.bidding.acceptPreapproval);
  
  app.route('/api/tasks/preapproval/reject').post(requesters.bidding.rejectPreapproval);
  
  app.route('/api/tasks/suspend').post(requesters.status.suspendTask);
  app.route('/api/tasks/unsuspend').post(requesters.status.unsuspendTask);

  // Bidding
  app.route('/api/tasks/bidding/reject').post(requesters.bidding.rejectBid);
  app.route('/api/tasks/bidding/activate').post(requesters.status.activateBidableTask);
  app.route('/api/tasks/bidding/bidder/info').post(requesters.taskCRUD.read.bidderInfo);

  app.route('/api/tasks/bidding/payment/create').post(requesters.bidding.acceptBid.create);
  app.route('/api/tasks/bidding/payment/execute').post(requesters.bidding.acceptBid.execute);

  // Finish by binding the Requester middleware
  app.param('requesterId', requesters.requesterByID);
};

/**
 * Requester middleware
 */
requesters.requesterByID = function(req, res, next, id) {
  next();
};
