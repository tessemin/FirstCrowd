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
        method: 'GET',
        url: 'api/workers/activeTasks/'
      },
      _createActiveTask: {
        method: 'POST',
        url: '/api/workers/activeTasks/'
      },
      _getActiveTask: {
        method: 'GET',
        url: '/api/workers/activeTask/:taskId'
      },
      _updateActiveTask: {
        method: 'PUT',
        url: '/api/workers/activeTask/:taskId'
      },
      _deleteActiveTask: {
        method: 'DELETE',
        url: '/api/workers/activeTask/:taskId'
      }
    });

    angular.extend(Workers, {
      getActiveTasks: function () {
        return this._getActiveTasks().$promise;
      },
      getActiveTask: function () {
        return this._getActiveTask().$promise;
      }
    });

    return Workers;
  }
}());
