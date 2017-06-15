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
      update: {
        method: 'PUT'
      }
    });
  }
}());
