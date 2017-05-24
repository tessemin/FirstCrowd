// Individuals service used to communicate Individuals REST endpoints
(function () {
  'use strict';

  angular
    .module('individuals')
    .factory('IndividualsService', IndividualsService);

  IndividualsService.$inject = ['$resource'];

  function IndividualsService($resource) {
    return $resource('api/individuals/:individualId', {
      individualId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
