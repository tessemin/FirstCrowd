(function () {
  'use strict';

  angular
    .module('workers')
    .controller('WorkersListController', WorkersListController);

  WorkersListController.$inject = ['WorkersService'];

  function WorkersListController(WorkersService) {
    var vm = this;

    vm.workers = WorkersService.query();
  }
}());
