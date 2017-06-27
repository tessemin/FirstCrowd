// Requesters service used to communicate Requesters REST endpoints
(function () {
  'use strict';

  angular
    .module('requesters')
    .factory('RequestersService', RequestersService);

  RequestersService.$inject = ['$resource'];

  function RequestersService($resource) {
    return $resource('api/requesters/:requesterId', {
      requesterId: '@_id'
    }, {
      // REJECTED TASKS
      // RATINGS
      _updateWorkerRating: {
        method: 'POST',
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
        method: 'POST',
        url: '/api/tasks/updateTask'
      }
    });
    
    angular.extend(Requesters, {
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
  }
}());