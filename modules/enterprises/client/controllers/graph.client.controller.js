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

    vm.chooseCompany = chooseCompany;
    vm.toggleSidebar = toggleSidebar;

    function toggleSidebar() {
      vm.sidebar = !vm.sidebar;
    }

    function chooseCompany(obj) {
      console.log(obj);
      $scope.$apply(
        vm.sidebar = true,
        vm.selected = obj.selected
      );
    }
  }
}());
