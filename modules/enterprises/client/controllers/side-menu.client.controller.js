(function () {
  'use strict';

  angular
    .module('enterprises')
    .controller('SideMenuController', SideMenuController);

  SideMenuController.$inject = ['menuService', 'Authentication'];

  function SideMenuController(menuService, Authentication) {
    var vm = this;
    vm.user = Authentication.user;

    vm.menu = menuService.getMenu('enterprise');
  }
}());
