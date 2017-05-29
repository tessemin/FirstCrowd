// Individuals service used to communicate Individuals REST endpoints
(function () {
  'use strict';

  angular
    .module('individuals')
    .factory('IndividualsService', IndividualsService);

  IndividualsService.$inject = ['$resource'];

  function IndividualsService($resource) {
    var Individuals = $resource('api/individuals/:individualId', {
      individualId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      updateCertifications: {
        method: 'POST',
        url: 'api/individuals/certifications/'
      }
    });
    
    angular.extend(Individuals, {
      updateCerts: function (certifications) {
        return this.updateCertifications(certifications).$promise;
      }
    });
    
    return Individuals;
  }
}());
