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
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
