(function () {
  'use strict';

  angular
    .module('enterprises')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('enterprises', {
        abstract: true,
        url: '/enterprises',
        template: '<ui-view/>'
      })
      .state('enterprises.list', {
        url: '',
        templateUrl: 'modules/enterprises/client/views/list-enterprises.client.view.html',
        controller: 'EnterprisesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Enterprises List'
        }
      })
      .state('enterprises.create', {
        url: '/create',
        templateUrl: 'modules/enterprises/client/views/form-enterprise.client.view.html',
        controller: 'EnterprisesController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: newEnterprise
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Enterprises Create'
        }
      })
      .state('enterprises.competitor', {
        url: '/enterprises/profile',
        templateUrl: 'modules/enterprises/client/views/form-enterprise.client.view.html',
        controller: 'EnterpriseCompetitorController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Enterprise {{ enterpriseResolve.name }}'
        }
      })
      .state('enterprises.customer', {
        url: '/enterprises/profile',
        templateUrl: 'modules/enterprises/client/views/form-enterprise.client.view.html',
        controller: 'EnterpriseCustomerController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Enterprise {{ enterpriseResolve.name }}'
        }
      })
      .state('enterprises.supplier', {
        url: '/enterprises/profile',
        templateUrl: 'modules/enterprises/client/views/form-enterprise.client.view.html',
        controller: 'EnterpriseSupplierController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Enterprise {{ enterpriseResolve.name }}'
        }
      })
      .state('enterprises.profile', {
        url: '/enterprises/profile',
        templateUrl: 'modules/enterprises/client/views/form-enterprise.client.view.html',
        controller: 'EnterprisesController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Enterprise {{ enterpriseResolve.name }}'
        }
      })
      .state('enterprises.edit', {
        url: '/:enterpriseId/edit',
        templateUrl: 'modules/enterprises/client/views/form-enterprise.client.view.html',
        controller: 'EnterprisesController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Enterprise {{ enterpriseResolve.name }}'
        }
      })
      .state('enterprises.view', {
        url: '/:enterpriseId',
        templateUrl: 'modules/enterprises/client/views/view-enterprise.client.view.html',
        controller: 'EnterprisesController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          pageTitle: 'Enterprise {{ enterpriseResolve.name }}'
        }
      });
  }

  getEnterprise.$inject = ['$stateParams', 'EnterprisesService'];

  function getEnterprise($stateParams, EnterprisesService) {
    return EnterprisesService.get({
      enterpriseId: $stateParams.enterpriseId
    }).$promise;
  }

  newEnterprise.$inject = ['EnterprisesService'];

  function newEnterprise(EnterprisesService) {
    return new EnterprisesService();
  }
}());
