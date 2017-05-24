(function () {
  'use strict';

  angular
    .module('individuals')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('individuals', {
        abstract: true,
        url: '/individuals',
        template: '<ui-view/>'
      })
      .state('individuals.list', {
        url: '',
        templateUrl: 'modules/individuals/client/views/list-individuals.client.view.html',
        controller: 'IndividualsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Individuals List'
        }
      })
      .state('individuals.create', {
        url: '/create',
        templateUrl: 'modules/individuals/client/views/form-individual.client.view.html',
        controller: 'IndividualsController',
        controllerAs: 'vm',
        resolve: {
          individualResolve: newIndividual
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Individuals Create'
        }
      })
      .state('individuals.edit', {
        url: '/:individualId/edit',
        templateUrl: 'modules/individuals/client/views/form-individual.client.view.html',
        controller: 'IndividualsController',
        controllerAs: 'vm',
        resolve: {
          individualResolve: getIndividual
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Individual {{ individualResolve.name }}'
        }
      })
      .state('individuals.view', {
        url: '/:individualId',
        templateUrl: 'modules/individuals/client/views/view-individual.client.view.html',
        controller: 'IndividualsController',
        controllerAs: 'vm',
        resolve: {
          individualResolve: getIndividual
        },
        data: {
          pageTitle: 'Individual {{ individualResolve.name }}'
        }
      });
  }

  getIndividual.$inject = ['$stateParams', 'IndividualsService'];

  function getIndividual($stateParams, IndividualsService) {
    return IndividualsService.get({
      individualId: $stateParams.individualId
    }).$promise;
  }

  newIndividual.$inject = ['IndividualsService'];

  function newIndividual(IndividualsService) {
    return new IndividualsService();
  }
}());
