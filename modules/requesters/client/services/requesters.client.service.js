// Requesters service used to communicate Requesters REST endpoints
(function () {
  'use strict';

  angular
    .module('requesters')
    .factory('RequestersService', RequestersService);

  RequestersService.$inject = ['$resource'];

  function RequestersService($resource) {
    var Requesters = $resource('api/requesters/:requesterId', {
      requesterId: '@_id'
    }, {
      // ALL REQUESTER TASKS
      _getAllTasks: {
        method: 'POST',
        url: '/api/requesters/tasks/all'
      },
      // ACTIVE TASKS
      _getActiveTasks: {
        method: 'POST',
        url: '/api/requesters/activeTask/all'
      },
      _activateTask: {
        method: 'POST',
        url: '/api/requesters/activateTask'
      },
      // SUSPENDED TASKS
      _getSuspendedTasks: {
        method: 'POST',
        url: '/api/requesters/suspendedTask/all'
      },
      // COMPLETED TASKS
      _getCompletedTasks: {
        method: 'POST',
        url: '/api/requesters/completedTask/all'
      },
      // REJECTED TASKS
      _getRejectedTasks: {
        method: 'POST',
        url: '/api/requesters/rejectedTask/all'
      },
      // RATINGS
      _makeRating: {
        method: 'PUT',
        url: '/api/requesters/workerRating/makeRating'
      },
      _getAllWorkerRatings: {
        method: 'POST',
        url: '/api/requesters/workerRating/all'
      },
      _deleteWorkerRating: {
        method: 'POST',
        url: '/api/requesters/workerRating/delete'
      },
      // REQUESTER INFORMATION
      _getRequesterData: {
        method: 'POST',
        url: '/api/requesters/getRequesterData'
      },
      _getAllRequesterRatings: {
        method: 'POST',
        url: '/api/requesters/getRequesterRatings'
      },
      _searchMyTasks: {
        method: 'POST',
        url: '/api/requesters/search/myTasks'
      },
      // TASK ACTIONS
      _createTask: {
        method: 'POST',
        url: '/api/tasks/createTask'
      },
      _deleteTask: {
        method: 'POST',
        url: '/api/tasks/deleteTask'
      },
      _updateTask: {
        method: 'PUT',
        url: '/api/tasks/updateTask'
      },
      _getWorkerRatingsForTask: {
        method: 'POST',
        url: '/api/tasks/getWorkerRatingsForTask'
      },
      _getRequesterRatingsForTask: {
        method: 'POST',
        url: '/api/tasks/getRequesterRatingsForTask'
      },
      _acceptPreapproval: {
        method: 'POST',
        url: '/api/tasks/preapproval/accept'
      },
      _rejectPreapproval: {
        method: 'POST',
        url: '/api/tasks/preapproval/reject'
      },
      _rejectCompletion: {
        method: 'POST',
        url: '/api/tasks/completion/reject'
      },
      _approveCompletion: {
        method: 'POST',
        url: '/api/tasks/completion/approve'
      },
      _retryCompletion: {
        method: 'POST',
        url: '/api/tasks/completion/retry'
      },
      // Biding actions
      _rejectBid: {
        method: 'POST',
        url: '/api/tasks/bidding/reject'
      },
      _activateBidable: {
        method: 'POST',
        url: '/api/tasks/bidding/activate'
      },
      _getBidderInfo: {
        method: 'POST',
        url: '/api/tasks/bidding/bidder/info'
      },
      // Files
      _getDownloadableTaskFiles: {
        method: 'POST',
        url: '/api/requesters/task/file/getDownloadables'
      },
      _sendMessage: {
        method: 'POST',
        url: '/api/requesters/task/file/sendMessage'
      }
    });

    angular.extend(Requesters, {
      // ALL REQUESTER TASKS
      getAllTasks: function() {
        return this._getAllTasks().$promise;
      },
      // ACTIVE TASKS
      getActiveTasks: function() {
        return this._getActiveTasks().$promise;
      },
      activateTask: function(taskId) {
        return this._activateTask(taskId).$promise;
      },
      // SUSPENDED TASKS
      getSuspendedTasks: function() {
        return this._getSuspendedTasks().$promise;
      },
      // COMPLETED TASKS
      getCompletedTasks: function() {
        return this._getCompletedTasks().$promise;
      },
      // REJECTED TASKS
      getRejectedTasks: function() {
        return this._getRejectedTasks().$promise;
      },
      // RATINGS
      makeRating: function (workerId_taskId) {
        return this._makeRating(workerId_taskId).$promise;
      },
      getAllWorkerRatings: function () {
        return this._getAllWorkerRatings().$promise;
      },
      deleteWorkerRating: function (workerId_taskId) {
        return this._deleteWorkerRating(workerId_taskId).$promise;
      },
      // REQUESTER INFORMATION
      getRequesterData: function () {
        return this._getRequesterData().$promise;
      },
      getRequesterRatings: function () {
        return this._getRequesterRatings().$promise;
      },
      searchMyTasks: function (query) {
        return this._searchMyTasks(query).$promise;
      },
      // TASK ACTIONS
      createTask: function (taskInfo) {
        return this._createTask(taskInfo).$promise;
      },
      deleteTask: function (taskId) {
        return this._deleteTask(taskId).$promise;
      },
      updateTask: function (taskId_updateInfo) {
        return this._updateTask(taskId_updateInfo).$promise;
      },
      getWorkerRatingsForTask: function (taskId) {
        return this._getWorkerRatingsForTask(taskId).$promise;
      },
      getRequesterRatingsForTask: function (taskId) {
        return this._getRequesterRatingsForTask(taskId).$promise;
      },
      acceptPreapproval: function (taskId_bidId) {
        return this._acceptPreapproval(taskId_bidId).$promise;
      },
      rejectPreapproval: function (taskId_bidId) {
        return this._rejectPreapproval(taskId_bidId).$promise;
      },
      rejectCompletion: function (taskId_workerId_message) {
        return this._rejectCompletion(taskId_workerId_message).$promise;
      },
      approveCompletion: function (taskId_workerId_message) {
        return this._approveCompletion(taskId_workerId_message).$promise;
      },
      retryCompletion: function (taskId_workerId_message) {
        return this._retryCompletion(taskId_workerId_message).$promise;
      },
      // Biding actions
      rejectBid: function (taskId_bidId) {
        return this._rejectBid(taskId_bidId).$promise;
      },
      activateBidable: function (taskId) {
        return this._activateBidable(taskId).$promise;
      },
      getBidderInfo: function (taskId) {
        return this._getBidderInfo(taskId).$promise;
      },
      // file
      getDownloadableTaskFiles: function (taskId) {
        return this._getDownloadableTaskFiles(taskId).$promise;
      },
      sendMessage: function (taskId_message) {
        return this._sendMessage(taskId_message).$promise;
      },
    });

    return Requesters;
  }
}());
