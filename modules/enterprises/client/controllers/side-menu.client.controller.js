(function () {
  'use strict';

  angular
    .module('enterprises')
    .controller('SideMenuController', SideMenuController);

  SideMenuController.$inject = ['menuService'];

  function SideMenuController(menuService) {
    var vm = this;

    vm.menu = menuService.getMenu('enterprise');
  }
}());
