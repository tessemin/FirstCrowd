(function () {
  'use strict';

  angular
    .module('requesters')
    .controller('RequestersListController', RequestersListController);

  RequestersListController.$inject = ['RequestersService'];

  function RequestersListController(RequestersService) {
    var vm = this;

    vm.requesters = RequestersService.query();
  }
}());
