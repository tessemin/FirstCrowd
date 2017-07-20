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
    vm.query = '';
    vm.text = [];
    vm.list = [];
    vm.header = 'Header!';
    vm.head = 'Head';

    vm.chooseCompany = chooseCompany;
    vm.toggleSidebar = toggleSidebar;
    vm.close = close;
    vm.search = search;
    vm.viewCatalog = viewCatalog;
    vm.viewDemands = viewDemands;
    vm.viewSuppliers = viewSuppliers;
    vm.viewCustomers = viewCustomers;
    vm.viewCompetitors = viewCompetitors;

    function close() {
      vm.selected = {};
    }

    function search(query) {
      EnterprisesService.fuzzyQuery({ query: query }).then(function (res) {
        console.log(res);
      });
    }

    function toggleSidebar() {
      vm.sidebar = !vm.sidebar;
    }

    function viewCatalog(obj) {
      EnterprisesService.getServices({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        console.log(res);
        // vm.list = res.
      });
      EnterprisesService.getProducts({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        console.log(res);
        // vm.list = res.
      });
    }
    function viewDemands(obj) {
      EnterprisesService.getDemands({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        console.log(res);
        vm.list = res.demands;
      });
    }
    function viewSuppliers(obj) {
      vm.selected = obj.selected;
      vm.sidebar = true;
      vm.head = 'Suppliers';
      vm.header = 'Suppliers for ';
      EnterprisesService.getSuppliers({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        vm.list = res.suppliers;
      });
    }
    function viewCustomers(obj) {
      vm.selected = obj.selected;
      vm.sidebar = true;
      vm.head = 'Customers';
      vm.header = 'Customers for ';
      EnterprisesService.getCustomers({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        vm.list = res.customers;
      });
    }
    function viewCompetitors(obj) {
      vm.selected = obj.selected;
      vm.sidebar = true;
      vm.head = 'Competitors';
      vm.header = 'Competitors for ';
      EnterprisesService.getCompetitors({enterpriseId: obj.selected.enterpriseId}).then(function(res) {
        vm.list = res.competitors;
        console.log(vm.list);
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
