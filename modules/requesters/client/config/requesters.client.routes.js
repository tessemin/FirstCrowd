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
      .state('requesters.tasks', {
        url: '/tasks',
        templateUrl: '/modules/requesters/client/views/requesters-tasks.client.view.html',
        controller: 'RequesterTasksController',
        controllerAs: 'vm'
      })
      .state('requesters.newtask', {
        url: '/tasks/new',
        templateUrl: '/modules/requesters/client/views/requester-new-task.client.view.html',
        controller: 'RequesterNewTaskController',
        controllerAs: 'vm'
      })
      .state('requesters.list', {
        url: '',
        templateUrl: '/modules/requesters/client/views/list-requesters.client.view.html',
        controller: 'RequestersListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Requesters List'
        }
      })
      .state('requesters.create', {
        url: '/create',
        templateUrl: '/modules/requesters/client/views/form-requester.client.view.html',
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
        templateUrl: '/modules/requesters/client/views/form-requester.client.view.html',
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
        templateUrl: '/modules/requesters/client/views/view-requester.client.view.html',
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
