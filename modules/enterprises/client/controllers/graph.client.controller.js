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
    vm.search = '';

    vm.chooseCompany = chooseCompany;
    vm.toggleSidebar = toggleSidebar;
    vm.con = con;

    function con() {
      var x = 'click';
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
