// Enterprises service used to communicate Enterprises REST endpoints
(function () {
  'use strict';

  angular
    .module('enterprises')
    .factory('EnterprisesService', EnterprisesService);

  EnterprisesService.$inject = ['$resource'];

  function EnterprisesService($resource) {
    return $resource('api/enterprises/:enterpriseId', {
      enterpriseId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
