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
    vm.list = [];
    vm.header = 'Header!';

    vm.chooseCompany = chooseCompany;
    vm.toggleSidebar = toggleSidebar;
    vm.close = close;
    vm.search = search;
    vm.viewCatalog = viewCatalog;
    vm.viewDemands = viewDemands;
    vm.viewSuppliers = viewSuppliers;
    vm.viewCustomers = viewCustomers;
    vm.viewCompetitors = viewCompetitors;

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

    function viewCatalog(obj) {
      EnterprisesService.getProducts({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        console.log(res);
        // vm.list = res.
      });
    }
    function viewDemands(obj) {
      EnterprisesService.getDemands({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        console.log(res);

        // vm.list = res.
      });
    }
    function viewSuppliers(obj) {
      vm.selected = obj.selected;
      vm.sidebar = true;
      vm.header = 'Suppliers for ';
      EnterprisesService.getSuppliers({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        console.log(res);

        vm.list = res;
      });
    }
    function viewCustomers(obj) {
      vm.selected = obj.selected;
      vm.sidebar = true;
      vm.header = 'Customers for ';
      EnterprisesService.getCustomers({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        console.log(res);

        vm.list = res;
      });
    }
    function viewCompetitors(obj) {
      vm.selected = obj.selected;
      vm.sidebar = true;
      vm.header = 'Competitors for ';
      EnterprisesService.getCompetitors({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        console.log(res);

        vm.list = res;
      });
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
