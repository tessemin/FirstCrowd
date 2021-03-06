(function () {
  'use strict';

  angular
    .module('workers')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('workers', {
        abstract: true,
        url: '/workers',
        template: '<ui-view/>'
      })
      .state('workers.tasks', {
        url: '/tasks',
        templateUrl: '/modules/workers/client/views/worker-tasks.client.view.html',
        controller: 'WorkerTasksController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: newWorker
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Workers Tasks'
        }
      })
      .state('workers.messages', {
        url: '/messages',
        templateUrl: '/modules/workers/client/views/messages-worker.client.view.html',
        controller: 'WorkersMessagesController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: newWorker
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Workers Messages'
        }
      })
      .state('workers.list', {
        url: '/list',
        templateUrl: '/modules/workers/client/views/list-workers.client.view.html',
        controller: 'WorkersListController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: newWorker
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Workers List'
        }
      })
      .state('workers.create', {
        url: '/create',
        templateUrl: '/modules/workers/client/views/form-worker.client.view.html',
        controller: 'WorkersController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: newWorker
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Workers Create'
        }
      })
      .state('workers.edit', {
        url: '/edit',
        templateUrl: '/modules/workers/client/views/form-worker.client.view.html',
        controller: 'WorkersController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: newWorker
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Worker {{ workerResolve.name }}'
        }
      })
      .state('workers.view', {
        url: '/:workerId',
        templateUrl: '/modules/workers/client/views/view-worker.client.view.html',
        controller: 'WorkersController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: newWorker
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Worker {{ workerResolve.name }}'
        }
      });
  }

  getWorker.$inject = ['$stateParams', 'WorkersService'];

  function getWorker($stateParams, WorkersService) {
    return WorkersService.get({
      workerId: $stateParams.workerId
    }).$promise;
  }

  newWorker.$inject = ['WorkersService'];

  function newWorker(WorkersService) {
    return new WorkersService();
  }
}());
