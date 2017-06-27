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
      _getAllTasks:{
        method: 'POST',
        url: '/api/requesters/tasks/all'
      },
      // ACTIVE TASKS
      _updateActiveTasks: {
        method: 'PUT',
        url: '/api/requesters/activeTask/update'
      },
      _getActiveTasks: {
        method: 'POST',
        url: '/api/requesters/activeTask/all'
      },
      _addActiveTask: {
        method: 'POST',
        url: '/api/requesters/activeTask/add'
      },
      // SUSPENDED TASKS
      _updateSuspendedTask: {
        method: 'PUT',
        url: '/api/requesters/suspendedTask/update'
      },
      _getSuspendedTasks: {
        method: 'POST',
        url: '/api/requesters/suspendedTask/all'
      },
      _addSuspendedTask: {
        method: 'POST',
        url: '/api/requesters/suspendedTask/add'
      },
      // COMPLETED TASKS
      _updateCompletedTask: {
        method: 'PUT',
        url: '/api/requesters/completedTask/update'
      },
      _getCompletedTasks: {
        method: 'POST',
        url: '/api/requesters/completedTask/all'
      },
      _addCompletedTask: {
        method: 'POST',
        url: '/api/requesters/completedTask/add'
      },
      // REJECTED TASKS
      _updateRejectedTask: {
        method: 'PUT',
        url: '/api/requesters/rejectedTask/update'
      },
      _getRejectedTasks: {
        method: 'POST',
        url: '/api/requesters/rejectedTask/all'
      },
      _addRejectedTask: {
        method: 'POST',
        url: '/api/requesters/rejectedTask/add'
      },
      // RATINGS
      _updateWorkerRating: {
        method: 'PUT',
        url: '/api/requesters/workerRating/update'
      },
      _getWorkerRatings: {
        method: 'POST',
        url: '/api/requesters/workerRating/all'
      },
      _createWorkerRating: {
        method: 'POST',
        url: '/api/requesters/workerRating/create'
      },
      // REQUESTER INFORMATION
      _getRequesterData: {
        method: 'POST',
        url: '/api/requesters/getRequesterData'
      },
      _getRequesterRatings: {
        method: 'POST',
        url: '/api/requesters/getRequesterRatings'
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
      }
    });

    angular.extend(Requesters, {
      // ALL REQUESTER TASKS
      getAllTasks: function() {
        return this._getAllTasks().$promise;
      },
      // ACTIVE TASKS
      updateActiveTasks: function() {
        return this._updateActiveTasks().$promise;
      },
      getActiveTasks: function() {
        return this._getActiveTasks().$promise;
      },
      addActiveTask: function() {
        return this._addActiveTask().$promise;
      },
      // SUSPENDED TASKS
      updateSuspendedTask: function() {
        return this._updateSuspendedTask().$promise;
      },
      getSuspendedTasks: function() {
        return this._getSuspendedTasks().$promise;
      },
      addSuspendedTask: function() {
        return this._addSuspendedTask().$promise;
      },
      // COMPLETED TASKS
      updateCompletedTask: function() {
        return this._updateCompletedTask().$promise;
      },
      getCompletedTasks: function() {
        return this._getCompletedTasks().$promise;
      },
      addCompletedTask: function() {
        return this._addCompletedTask().$promise;
      },
      // REJECTED TASKS
      updateRejectedTask: function() {
        return this._updateRejectedTask().$promise;
      },
      getRejectedTasks: function() {
        return this._getRejectedTasks().$promise;
      },
      addRejectedTask: function() {
        return this._addRejectedTask().$promise;
      },
      // RATINGS
      updateWorkerRating: function () {
        return this._updateWorkerRating().$promise;
      },
      getWorkerRatings: function () {
        return this._getWorkerRatings().$promise;
      },
      createWorkerRating: function () {
        return this._createWorkerRating().$promise;
      },
      // REQUESTER INFORMATION
      getRequesterData: function () {
        return this._getRequesterData().$promise;
      },
      getRequesterRatings: function () {
        return this._getRequesterRatings().$promise;
      },
      // TASK ACTIONS
      createTask: function () {
        return this._createTask().$promise;
      },
      deleteTask: function () {
        return this._deleteTask().$promise;
      },
      updateTask: function () {
        return this._updateTask().$promise;
      }
    });

    return Requesters;
  }
}());
