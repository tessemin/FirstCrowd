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
      // console.log(obj.selected);
      // EnterprisesService.getPartners(obj.enterpriseId).then(function(res) {
      //   console.log(res);

      //   // vm.list = res.
      // });
    }
    function viewDemands(obj) {
      // console.log(obj.selected);
      // EnterprisesService.getPartners(obj.enterpriseId).then(function(res) {
      //   console.log(res);

      //   // vm.list = res.
      // });
    }
    function viewSuppliers(obj) {
      console.log(obj.selected.enterpriseId);
      EnterprisesService.getPartners(obj.selected.enterpriseId).then(function(req, res, err) {
        console.log(req, res, err);

        // vm.list = res.
      });
    }
    function viewCustomers(obj) {
      console.log(obj.selected.enterpriseId);
      EnterprisesService.getPartners(obj.selected.enterpriseId).then(function(req, res, err) {
        console.log(req, res, err);

        // vm.list = res.
      });
    }
    function viewCompetitors(obj) {
      console.log(obj.selected.enterpriseId);
      EnterprisesService.getPartners(obj.selected.enterpriseId).then(function(req, res, err) {
        console.log(req, res, err);

        // vm.list = res.
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
