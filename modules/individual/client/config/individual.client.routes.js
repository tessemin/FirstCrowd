(function () {
  'use strict';

  angular
    .module('individual.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('individual', {
        url: '/individual',
        templateUrl: '/modules/individual/client/views/individual.client.view.html',
        controller: 'IndividualController',
        controllerAs: 'vm'
      });
      // .state('individual.view', {
      //   url: '/individual/:individualId',
      //   templateUrl: '/modules/individual/client/views/individual.client.view.html',
      //   controller: 'IndividualController',
      //   controllerAs: 'vm',
      //   resolve: {
      //     individualResolve: getIndividual
      //   },
      //   data: {
      //     pageTitle: 'Individual {{ individualResolve.title }}'
      //   }
      // });
  }

  // getIndividual.$inject = ['$stateParams', 'IndividualService'];

  // function getIndividual($stateParams, IndividualService) {
  //   return IndividualService.get({
  //     individualId: $stateParams.individualId
  //   }).$promise;
  // }
}());
