(function () {
  'use strict';

  angular
    .module('requesters')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('requesters', {
        abstract: true,
        url: '/requesters',
        template: '<ui-view/>'
      })
      .state('requesters.list', {
        url: '',
        templateUrl: 'modules/requesters/client/views/list-requesters.client.view.html',
        controller: 'RequestersListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Requesters List'
        }
      })
      .state('requesters.create', {
        url: '/create',
        templateUrl: 'modules/requesters/client/views/form-requester.client.view.html',
        controller: 'RequestersController',
        controllerAs: 'vm',
        resolve: {
          requesterResolve: newRequester
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Requesters Create'
        }
      })
      .state('requesters.edit', {
        url: '/:requesterId/edit',
        templateUrl: 'modules/requesters/client/views/form-requester.client.view.html',
        controller: 'RequestersController',
        controllerAs: 'vm',
        resolve: {
          requesterResolve: getRequester
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Requester {{ requesterResolve.name }}'
        }
      })
      .state('requesters.view', {
        url: '/:requesterId',
        templateUrl: 'modules/requesters/client/views/view-requester.client.view.html',
        controller: 'RequestersController',
        controllerAs: 'vm',
        resolve: {
          requesterResolve: getRequester
        },
        data: {
          pageTitle: 'Requester {{ requesterResolve.name }}'
        }
      });
  }

  getRequester.$inject = ['$stateParams', 'RequestersService'];

  function getRequester($stateParams, RequestersService) {
    return RequestersService.get({
      requesterId: $stateParams.requesterId
    }).$promise;
  }

  newRequester.$inject = ['RequestersService'];

  function newRequester(RequestersService) {
    return new RequestersService();
  }
}());
