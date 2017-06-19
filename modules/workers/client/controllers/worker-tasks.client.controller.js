(function () {
  'use strict';

  // Workers controller
  angular
    .module('workers')
    .controller('WorkerTasksController', WorkerTasksController);

  WorkerTasksController.$inject = ['$scope', '$state', ];

  function WorkerTasksController ($scope, $state) {
    var vm = this;
    // Filters
    vm.filters = {};
    vm.filters.name = '';
    vm.filters.postingDate = '';
    vm.filters.deadline = '';
    vm.filters.status = '';
    
    // Dummy tasks while building system
    vm.tasks = [{
      '_id': 12315327,
      'name': 'dummy task',
      'postingDate': '06/13/17',
      'deadline': '06/30/17',
      'status': 'taken',
      'progress': 50
    }, {
      '_id': 12315328,
      'name': 'fix thing',
      'postingDate': '05/11/17',
      'deadline': '07/31/17',
      'status': 'taken',
      'progress': 0
    }, {
      '_id': 12315329,
      'name': 'install whatzit',
      'postingDate': '06/16/17',
      'deadline': '08/15/17',
      'status': 'taken',
      'progress': 20
    }];
    (function updateProgressBars() {
      for(var i = 0; i < vm.tasks.length; ++i) {
        vm.tasks[i].style = {
          'width': (vm.tasks[i].progress + '%')
        };
      }
    })();
  }
}());
