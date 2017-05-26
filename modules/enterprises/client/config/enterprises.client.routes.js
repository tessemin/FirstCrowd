(function () {
  'use strict';

  angular
    .module('enterprises')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('enterprises', {
        // abstract: true,
        url: '/enterprises',
        // template: '<ui-view/>'
        templateUrl: 'modules/enterprises/client/views/side-menu.client.view.html',
        controller: 'EnterprisesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Enterprises List'
        }
      })
      // .state('enterprises.list', {
      //   url: '',
      //   templateUrl: 'modules/enterprises/client/views/side-menu.client.view.html',
      //   controller: 'EnterprisesListController',
      //   controllerAs: 'vm',
      //   data: {
      //     pageTitle: 'Enterprises List'
      //   }
      // })
      .state('enterprises.create', {
        url: '/create',
        templateUrl: 'modules/enterprises/client/views/form-enterprise.client.view.html',
        controller: 'EnterprisesController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: newEnterprise
        },
        data: {
          // roles: ['user', 'admin'],
          pageTitle: 'Enterprises Create'
        }
      })
      .state('enterprises.competitor', {
        url: '/competitors',
        templateUrl: 'modules/enterprises/client/views/form-competitor.client.view.html',
        controller: 'EnterpriseCompetitorController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin', 'enterprise'],
          pageTitle: 'Edit Enterprise {{ enterpriseResolve.name }}'
        }
      })
      .state('enterprises.customer', {
        url: '/customers',
        templateUrl: 'modules/enterprises/client/views/form-customer.client.view.html',
        controller: 'EnterpriseCustomerController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin', 'enterprise'],
          pageTitle: 'Edit Enterprise {{ enterpriseResolve.name }}'
        }
      })
      .state('enterprises.supplier', {
        url: '/suppliers',
        templateUrl: 'modules/enterprises/client/views/form-supplier.client.view.html',
        controller: 'EnterpriseSupplierController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin', 'enterprise'],
          pageTitle: 'Edit Enterprise {{ enterpriseResolve.name }}'
        }
      })
      .state('enterprises.profile', {
        url: '',
        templateUrl: 'modules/enterprises/client/views/form-enterprise.client.view.html',
        controller: 'EnterprisesController',
        controllerAs: 'vm',
        resolve: {
          enterpriseResolve: getEnterprise
        },
        data: {
          roles: ['user', 'admin', 'enterprise'],
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
          roles: ['user', 'admin', 'enterprise'],
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

    console.log(EnterprisesService.get({
      enterpriseId: $stateParams.enterpriseId
    }));



    return EnterprisesService.get({
      enterpriseId: $stateParams.enterpriseId
    }).$promise;
  }

  newEnterprise.$inject = ['EnterprisesService'];

  function newEnterprise(EnterprisesService) {
    return new EnterprisesService();
  }
}());
