(function () {
  'use strict';

  angular
    .module('individual.services')
    .factory('IndividualService', IndividualService);

  IndividualService.$inject = ['$resource', '$log'];

  function IndividualService($resource, $log) {
    var Individual = $resource('/api/individual/:individualId', {
      individualId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Individual.prototype, {
      createOrUpdate: function () {
        var individual = this;
        return createOrUpdate(individual);
      }
    });

    return Individual;

    function createOrUpdate(individual) {
      if (individual._id) {
        return individual.$update(onSuccess, onError);
      } else {
        return individual.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(individual) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());
