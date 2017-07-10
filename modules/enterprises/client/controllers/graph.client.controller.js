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
    vm.text = [];

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
        vm.selected = obj.selected,
        vm.text[0] = 'Message ' + obj.selected.companyName,
        vm.text[1] = 'View the ' + obj.selected.companyName + ' Profile',
        vm.text[2] = 'See the ' + obj.selected.companyName + ' Connection Graph',
        vm.text[3] = 'Compare your Company with ' + obj.selected.companyName
      );
    }
  }
}());
