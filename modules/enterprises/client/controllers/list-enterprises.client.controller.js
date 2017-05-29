(function () {
  'use strict';

  angular
    .module('enterprises')
    .controller('EnterprisesListController', EnterprisesListController);

  EnterprisesListController.$inject = ['EnterprisesService', 'menuService'];

  function EnterprisesListController(EnterprisesService, menuService) {
    var vm = this;

    vm.enterprises = EnterprisesService.query();
  }
}());
