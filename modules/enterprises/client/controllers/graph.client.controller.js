(function () {
  'use strict';

  // Enterprises controller
  angular
    .module('enterprises')
    .controller('EnterpriseGraphController', EnterpriseGraphController);

  EnterpriseGraphController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseGraphController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;
    vm.sidebar = false;
    vm.selected = {};
    vm.searching = '';

    vm.chooseCompany = chooseCompany;
    vm.toggleSidebar = toggleSidebar;
    vm.close = close;
    vm.search = search;

    var x = '';
    function close() {
      vm.selected = {};
      // x = 'close';
      // console.log(x);
    }

    function search() {
      x = 'search';
      console.log(x);
    }

    function toggleSidebar() {
      vm.sidebar = !vm.sidebar;
    }

    function chooseCompany(obj) {
      $scope.$apply(
        vm.sidebar = true,
        vm.selected = obj.selected
      );
    }
  }
}());
