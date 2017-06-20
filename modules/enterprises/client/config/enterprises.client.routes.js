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
        templateUrl: '/modules/enterprises/client/views/side-menu.client.view.html',
        controller: 'SideMenuController',
        controllerAs: 'vm'
      })
      .state('graph', {
        url: '/graph',
        templateUrl: '/modules/enterprises/client/views/graph.client.view.html',
        controller: 'EnterpriseGraphController',
        controllerAs: 'vm',
        data: {
          roles: ['enterprise'],
          pageTitle: 'Enterprise Graph'
        }
      })
      .state('enterprises.profile', {
        url: '/profile',
        templateUrl: '/modules/enterprises/client/views/form-profile.client.view.html',
        controller: 'EnterpriseProfileController',
        controllerAs: 'vm',
        data: {
          roles: ['enterprise'],
          pageTitle: 'Edit your Enterprise Profile'
        }
      })
      .state('enterprises.competitor', {
        url: '/competitors',
        templateUrl: '/modules/enterprises/client/views/form-competitor.client.view.html',
        controller: 'EnterpriseCompetitorController',
        controllerAs: 'vm',
        data: {
          roles: ['enterprise'],
          pageTitle: 'Edit your Competitor List'
        }
      })
      .state('enterprises.customer', {
        url: '/customers',
        templateUrl: '/modules/enterprises/client/views/form-customer.client.view.html',
        controller: 'EnterpriseCustomerController',
        controllerAs: 'vm',
        data: {
          roles: ['enterprise'],
          pageTitle: 'Edit your Customer List'
        }
      })
      .state('enterprises.supplier', {
        url: '/suppliers',
        templateUrl: '/modules/enterprises/client/views/form-supplier.client.view.html',
        controller: 'EnterpriseSupplierController',
        controllerAs: 'vm',
        data: {
          roles: ['enterprise'],
          pageTitle: 'Edit your Supplier List'
        }
      })
      .state('enterprises.list', {
        url: '',
        templateUrl: '/modules/enterprises/client/views/list-enterprises.client.view.html',
        controller: 'EnterprisesListController',
        controllerAs: 'vm',
        data: {
          roles: ['enterprise'],
          pageTitle: 'Enterprises List'
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
