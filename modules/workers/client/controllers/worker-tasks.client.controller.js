(function () {
  'use strict';

  // Workers controller
  angular
    .module('workers')
    .controller('WorkerTasksController', WorkerTasksController);

  WorkerTasksController.$inject = ['$scope', '$state', ];

  function WorkerTasksController ($scope, $state) {
    var vm = this;
    vm.tasks = [{
      '_id': 12315327,
      'name': 'dummy task',
      'postingDate': '06/13/17',
      'deadline': '06/30/17',
      'status': 'taken',
      'progress': 0.5
    }];
  }
}());
