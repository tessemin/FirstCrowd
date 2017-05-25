(function () {
  'use strict';

  angular
    .module('enterprises')
    .controller('EnterprisesListController', EnterprisesListController);

  EnterprisesListController.$inject = ['EnterprisesService', 'menuService'];

  function EnterprisesListController(EnterprisesService, menuService) {
    var vm = this;

    vm.menu = menuService.getMenu('enterprise');
    console.log(vm.menu);

    vm.enterprises = EnterprisesService.query();
  }
}());
