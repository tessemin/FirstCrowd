// Workers service used to communicate Workers REST endpoints
(function () {
  'use strict';

  angular
    .module('workers')
    .factory('WorkersService', WorkersService);

  WorkersService.$inject = ['$resource'];

  function WorkersService($resource) {
    var Workers = $resource('api/workers/:taskId', {
      taskId: '@_id'
    }, {
      _getActiveTasks: {
        method: 'POST',
        url: '/api/workers/activeTask/all'
      },
      _updateActiveTask: {
        method: 'POST',
        url: '/api/workers/activeTask/update'
      },
      _getRejectedTasks: {
        method: 'POST',
        url: '/api/workers/rejectedTask/all'
      },
      _updateRejectedTask: {
        method: 'PUT',
        url: '/api/workers/RejectedTask/'
      },
      _getCompletedTasks: {
        method: 'POST',
        url: '/api/workers/completedTask/all'
      },
      _updateCompletedTask: {
        method: 'PUT',
        url: '/api/workers/completedTask/'
      },
      _getInactiveTasks: {
        method: 'POST',
        url: '/api/workers/inactiveTask/all'
      },
      _updateInactiveTask: {
        method: 'PUT',
        url: '/api/workers/inactiveTask/'
      },
      _getRecomendedTasks: {
        method: 'POST',
        url: '/api/workers/recomendedTask/all'
      },
      _updateRecomendedTask: {
        method: 'PUT',
        url: '/api/workers/recomendedTask/'
      },
      // Worker Actions
      _takeTask: {
        method: 'POST',
        url: '/api/workers/task/take'
      },
      _submitToTask: {
        method: 'POST',
        url: '/api/workers/task/submit'
      },
      _getDownloadableTaskFiles: {
        method: 'POST',
        url: '/api/workers/task/file/getDownloadables'
      },
      _sendMessage: {
        method: 'POST',
        url: '/api/workers/task/file/sendMessage'
      },
      _markCompleted: {
        method: 'POST',
        url: '/api/workers/task/markCompleted'
      },
      // General Task Functions
      _getAllOpenTasks: {
        method: 'POST',
        url: '/api/getAllTasks/open'
      },
      _getOneTask: {
        method: 'POST',
        url: '/api/getOneTask'
      },
      _getWorkerForTask: {
        method: 'POST',
        url: '/api/task/getYourWorker'
      },
      _getTasksWithOptions: {
        method: 'POST',
        url: '/api/getTasksWithOptions'
      },
      // search tasks
      _searchMyTasks: {
        method: 'POST',
        url: '/api/workers/tasks/search/myTasks'
      },
      _searchOpenTasks: {
        method: 'POST',
        url: '/api/workers/tasks/search/openTasks'
      }
    });

    angular.extend(Workers, {
      // active
      getActiveTasks: function () {
        return this._getActiveTasks().$promise;
      },
      updateActiveTask: function (Id) {
        return this._updateActiveTask(Id).$promise;
      },
      // rejected
      getRejectedTasks: function () {
        return this._getRejectedTasks().$promise;
      },
      updateRejectedTask: function (Id) {
        return this._updateRejectedTask(Id).$promise;
      },
      // completed
      getCompletedTasks: function () {
        return this._getCompletedTasks().$promise;
      },
      updateCompletedTask: function (Id) {
        return this._updateCompletedTask(Id).$promise;
      },
      // inactive
      getInactiveTasks: function () {
        return this._getInactiveTasks().$promise;
      },
      updateInactiveTask: function (Id) {
        return this._updateInactiveTask(Id).$promise;
      },
      // recomended
      getRecomendedTasks: function () {
        return this._getRecomendedTasks().$promise;
      },
      updateRecomendedTask: function (Id) {
        return this._updateRecomendedTask(Id).$promise;
      },
      // Worker Actions
      takeTask: function (taskId_bid) {
        return this._takeTask(taskId_bid).$promise;
      },
      submitToTask: function (taskId_submission) {
        return this._submitToTask(taskId_submission).$promise;
      },
      getDownloadableTaskFiles: function (taskId) {
        return this._getDownloadableTaskFiles(taskId).$promise;
      },
      sendMessage: function (taskId_message) {
        return this._sendMessage(taskId_message).$promise;
      },
      markCompleted: function (taskId) {
        return this._markCompleted(taskId).$promise;
      },
      // all tasks
      getAllOpenTasks: function () {
        return this._getAllOpenTasks().$promise;
      },
      getOneTasks: function (Id) {
        return this._getOneTasks(Id).$promise;
      },
      getWorkerForTask: function (Id) {
        return this._getWorkerForTask(Id).$promise;
      },
      getTasksWithOptions: function (options) {
        return this._getTasksWithOptions(options).$promise;
      },
      searchMyTasks: function (query) {
        return this._searchMyTasks(query).$promise;
      },
      searchOpenTasks: function (query) {
        return this._searchOpenTasks(query).$promise;
      }
    });

    return Workers;
  }
}());
