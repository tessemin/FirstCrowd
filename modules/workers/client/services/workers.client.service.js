// Workers service used to communicate Workers REST endpoints
(function () {
  'use strict';

  angular
    .module('workers')
    .factory('WorkersService', WorkersService);

  WorkersService.$inject = ['$resource'];

  function WorkersService($resource) {
    var Workers = $resource('api/workers/:workerId', {
      workerId: '@_id'
    }, {
      _update: {
        method: 'PUT'
      },
      _getActiveTasks: {
        method: 'POST',
        url: '/api/workers/activeTask/all'
      },
      _addActiveTask: {
        method: 'POST',
        url: '/api/workers/activeTask/add'
      },
      _getActiveTask: {
        method: 'POST',
        url: '/api/workers/activeTask/'
      },
      _updateActiveTask: {
        method: 'PUT',
        url: '/api/workers/activeTask/'
      },
      _deleteActiveTask: {
        method: 'DELETE',
        url: '/api/workers/activeTask/'
      },
      _getRejectedTasks: {
        method: 'POST',
        url: '/api/workers/RejectedTask/all'
      },
      _addRejectedTask: {
        method: 'POST',
        url: '/api/workers/RejectedTask/add'
      },
      _getRejectedTask: {
        method: 'POST',
        url: '/api/workers/RejectedTask/'
      },
      _updateRejectedTask: {
        method: 'PUT',
        url: '/api/workers/RejectedTask/'
      },
      _deleteRejectedTask: {
        method: 'DELETE',
        url: '/api/workers/RejectedTask/'
      },
      _getCompletedTasks: {
        method: 'POST',
        url: '/api/workers/CompletedTask/all'
      },
      _addCompletedTask: {
        method: 'POST',
        url: '/api/workers/CompletedTask/add'
      },
      _getCompletedTask: {
        method: 'POST',
        url: '/api/workers/CompletedTask/'
      },
      _updateCompletedTask: {
        method: 'PUT',
        url: '/api/workers/CompletedTask/'
      },
      _deleteCompletedTask: {
        method: 'DELETE',
        url: '/api/workers/CompletedTask/'
      },
      _getInactiveTasks: {
        method: 'POST',
        url: '/api/workers/InactiveTask/all'
      },
      _addInactiveTask: {
        method: 'POST',
        url: '/api/workers/InactiveTask/add'
      },
      _getInactiveTask: {
        method: 'POST',
        url: '/api/workers/InactiveTask/'
      },
      _updateInactiveTask: {
        method: 'PUT',
        url: '/api/workers/InactiveTask/'
      },
      _deleteInactiveTask: {
        method: 'DELETE',
        url: '/api/workers/InactiveTask/'
      },
      _getRecomendedTasks: {
        method: 'POST',
        url: '/api/workers/RecomendedTask/all'
      },
      _getRecomendedTask: {
        method: 'POST',
        url: '/api/workers/RecomendedTask/'
      },
      _updateRecomendedTask: {
        method: 'PUT',
        url: '/api/workers/RecomendedTask/'
      },
      _deleteRecomendedTask: {
        method: 'DELETE',
        url: '/api/workers/RecomendedTask/'
      },
      // Gets all tasks
      _getAllTasks: {
        method: 'POST',
        url: '/api/getAllTasks'
      }
    });

    angular.extend(Workers, {
      // active
      getActiveTasks: function () {
        return this._getActiveTasks().$promise;
      },
      getActiveTask: function () {
        return this._getActiveTask().$promise;
      },
      addActiveTask: function () {
        return this._addActiveTask().$promise;
      },
      updateActiveTask: function () {
        return this._updateActiveTask().$promise;
      },
      deleteActiveTask: function () {
        return this._deleteActiveTask().$promise;
      },
      // rejected
      getRejectedTasks: function () {
        return this._getRejectedTasks().$promise;
      },
      getRejectedTask: function () {
        return this._getRejectedTask().$promise;
      },
      addRejectedTask: function () {
        return this._addRejectedTask().$promise;
      },
      updateRejectedTask: function () {
        return this._updateRejectedTask().$promise;
      },
      deleteRejectedTask: function () {
        return this._deleteRejectedTask().$promise;
      },
      // completed
      getCompletedTasks: function () {
        return this._getCompletedTasks().$promise;
      },
      getCompletedTask: function () {
        return this._getCompletedTask().$promise;
      },
      addCompletedTask: function () {
        return this._addCompletedTask().$promise;
      },
      updateCompletedTask: function () {
        return this._updateCompletedTask().$promise;
      },
      deleteCompletedTask: function () {
        return this._deleteCompletedTask().$promise;
      },
      // inactive
      getInactiveTasks: function () {
        return this._getInactiveTasks().$promise;
      },
      getInactiveTask: function () {
        return this._getInactiveTask().$promise;
      },
      addInactiveTask: function () {
        return this._addInactiveTask().$promise;
      },
      updateInactiveTask: function () {
        return this._updateInactiveTask().$promise;
      },
      deleteInactiveTask: function () {
        return this._deleteInactiveTask().$promise;
      },
      // recomended
      getRecomendedTasks: function () {
        return this._getRecomendedTasks().$promise;
      },
      getRecomendedTask: function () {
        return this._getRecomendedTask().$promise;
      },
      updateRecomendedTask: function () {
        return this._updateRecomendedTask().$promise;
      },
      deleteRecomendedTask: function () {
        return this._deleteRecomendedTask().$promise;
      },
      getAllTasks: function () {
        return this._getAllTasks().$promise;
      }
    });

    return Workers;
  }
}());
