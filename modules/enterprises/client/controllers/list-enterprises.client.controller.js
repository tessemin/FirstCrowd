(function () {
  'use strict';

  angular
    .module('enterprises')
    .controller('EnterprisesListController', EnterprisesListController);

  EnterprisesListController.$inject = ['EnterprisesService'];

  function EnterprisesListController(EnterprisesService) {
    var vm = this;

    vm.enterprises = EnterprisesService.query();
  }
}());
