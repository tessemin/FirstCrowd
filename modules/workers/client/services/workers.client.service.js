// Workers service used to communicate Workers REST endpoints
(function () {
  'use strict';

  angular
    .module('workers')
    .factory('WorkersService', WorkersService);

  WorkersService.$inject = ['$resource'];

  function WorkersService($resource) {
    return $resource('api/workers/:workerId', {
      workerId: '@_id'
    }
    return $resource('api/workers/:taskId', {
      taskId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      getActiveTasks: {
        method: 'GET',
        url: '/api/workers/activeTasks/'
      },
      createActiveTask: {
        method: 'POST',
        url: '/api/workers/activeTasks/'
      },
      getActiveTask: {
        method: 'GET',
        url: '/api/workers/activeTask/:taskId'
      },
      updateActiveTask: {
        method: 'PUT',
        url: '/api/workers/activeTask/:taskId'
      },
      deleteActiveTask: {
        method: 'DELETE',
        url: '/api/workers/activeTask/:taskId'
      }
    )}});

    angular.extend(Workers, {
      _getActiveTasks: function () {
        return this.getActiveTasks().$promise;
      },
      _getActiveTask: function () {
        return this.getActiveTask().$promise;
      }
    });
  }
}());
