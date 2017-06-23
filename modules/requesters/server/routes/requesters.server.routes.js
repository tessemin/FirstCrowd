'use strict';

/**
 * Module dependencies
 */
var requestersPolicy = require('../policies/requesters.server.policy'),
  requesters = require('../controllers/requesters.server.controller');

module.exports = function(app) {
  // Requesters Routes
  app.route('/api/requesters').all(requestersPolicy.isAllowed)
    .get(requesters.list)
    .post(requesters.create);

  app.route('/api/requesters/:requesterId').all(requestersPolicy.isAllowed)
    .get(requesters.read)
    .put(requesters.update)
    .delete(requesters.delete);
    
  /*
   * REQUESTER TABLE
   */
/*   
  // ACTIVE TASKS
  app.route('/api/requesters/activeTask/').put(requesters.activeTask.update)
  app.route('/api/requesters/activeTask/all').post(requesters.activeTask.all);
  app.route('/api/requesters/activeTask/add').post(requesters.activeTask.add);
  
  // SUSPENDED TASKS
  app.route('/api/requesters/suspendedTask/').put(requesters.suspendedTask.update);
  app.route('/api/requesters/suspendedTask/all').post(requesters.suspendedTask.all);
  app.route('/api/requesters/suspendedTask/add').post(requesters.suspendedTask.add);
  
  // COMPLETED TASKS
  app.route('/api/requesters/completedTask/').put(requesters.completedTask.update);
  app.route('/api/requesters/completedTask/all').post(requesters.completedTask.all);
  app.route('/api/requesters/completedTask/add').post(requesters.completedTask.add);
  
  // REJECTED TASKS
  app.route('/api/requesters/rejectedTask/').put(requesters.rejectedTask.update);
  app.route('/api/requesters/rejectedTask/all').post(requesters.rejectedTask.all);
  app.route('/api/requesters/rejectedTask/add').post(requesters.rejectedTask.add);
  
  // RATINGS
  app.route('/api/requesters/workerRating/').put(requesters.workerRating.update);
  app.route('/api/requesters/workerRating/all').post(requesters.workerRating.all);
  app.route('/api/requesters/workerRating/add').post(requesters.workerRating.add);
  
  // MISC INFORMATION
  app.route('/api/requesters/getRequesterData/').post(requesters.getRequesterData.all); */
  
  /*
   * TASK TABLE
   */
  
  // CREATE A NEW TASK

  // Finish by binding the Requester middleware
  app.param('requesterId', requesters.requesterByID);
};
