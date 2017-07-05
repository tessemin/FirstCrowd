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
        method: 'PUT',
        url: '/api/workers/activeTask/'
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
        url: '/api/workers/takeTask/'
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
      takeTask: function (taksId_bid) {
        return this._takeTask(taksId_bid).$promise;
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
      }
    });

    return Workers;
  }
}());
