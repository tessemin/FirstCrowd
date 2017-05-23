(function () {
  'use strict';

  angular
    .module('individual.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('individual', {
        abstract: true,
        url: '/individual',
        template: '<ui-view/>'
      })
      .state('individual.view', {
        url: '/:individualId',
        templateUrl: '/modules/individual/client/views/individual.client.view.html',
        controller: 'IndividualController',
        controllerAs: 'vm',
        resolve: {
          individualResolve: getIndividual
        },
        data: {
          pageTitle: 'Individual {{ individualResolve.title }}'
        }
      });
  }

  getIndividual.$inject = ['$stateParams', 'IndividualService'];

  function getIndividual($stateParams, IndividualService) {
    return IndividualService.get({
      individualId: $stateParams.individualId
    }).$promise;
  }
}());
