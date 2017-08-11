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
    vm.demands = [];
    vm.products = [];
    vm.service = [];
    vm.searchResults = [];
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
    vm.makeGraphForCompany = makeGraphForCompany;

    function close() {
      vm.selected = {};
    }

    function search(query) {
      EnterprisesService.fuzzyQuery({ query: query }).then(function (res) {
        vm.searchResults = res.searchResults;
        vm.searchResultsShow = true;
      });
    }

    function toggleSidebar() {
      vm.sidebar = !vm.sidebar;
    }

    function viewCatalog(obj) {

      vm.selected = obj.selected;
      vm.sidebar = true;
      vm.head = 'Catalog';
      vm.header = 'Products and Services by ';

      vm.list = [];
      vm.demands = null;

      if (vm.selected.hasOwnProperty('profile')) {
        vm.selected.companyName = vm.selected.profile.companyName;
        vm.selected.countryOfBusiness = vm.selected.profile.countryOfBusiness;
        vm.selected.classifications = vm.selected.profile.classifications;
        vm.selected.URL = vm.selected.profile.URL;
        vm.selected.yearEstablished = vm.selected.profile.yearEstablished;
        vm.selected.description = vm.selected.profile.description;
      }

      var promises = [];
      promises.push(EnterprisesService.getServices({ enterpriseId: obj.selected._id }));
      promises.push(EnterprisesService.getProducts({ enterpriseId: obj.selected._id }));

      Promise.all(promises).then(function(res) {
        $scope.$apply(
          vm.services = res[0].services,
          vm.products = res[1].products
        );
      });
    }
    function viewDemands(obj) {

      vm.selected = obj.selected;

      if (vm.selected.hasOwnProperty('profile')) {
        vm.selected.companyName = vm.selected.profile.companyName;
        vm.selected.countryOfBusiness = vm.selected.profile.countryOfBusiness;
        vm.selected.classifications = vm.selected.profile.classifications;
        vm.selected.URL = vm.selected.profile.URL;
        vm.selected.yearEstablished = vm.selected.profile.yearEstablished;
        vm.selected.description = vm.selected.profile.description;
      }

      vm.sidebar = true;
      vm.head = 'Demands';
      vm.header = 'Demands from';

      vm.services = null;
      vm.products = null;
      vm.list = [];

      EnterprisesService.getDemands({ enterpriseId: obj.selected._id }).then(function(res) {
        vm.demands = res.demands;
      });
    }

    function viewSuppliers(obj) {
      vm.selected = obj.selected;

      if (vm.selected.hasOwnProperty('profile')) {
        vm.selected.companyName = vm.selected.profile.companyName;
        vm.selected.countryOfBusiness = vm.selected.profile.countryOfBusiness;
        vm.selected.classifications = vm.selected.profile.classifications;
        vm.selected.URL = vm.selected.profile.URL;
        vm.selected.yearEstablished = vm.selected.profile.yearEstablished;
        vm.selected.description = vm.selected.profile.description;
      }

      vm.sidebar = true;
      vm.head = 'Suppliers';
      vm.header = 'Suppliers for ';
      vm.demands = null;
      vm.services = null;
      vm.products = null;

      EnterprisesService.getSuppliers({ enterpriseId: obj.selected._id }).then(function(res) {
        vm.list = res.suppliers;
      });
    }
    function viewCustomers(obj) {
      vm.selected = obj.selected;

      if (vm.selected.hasOwnProperty('profile')) {
        vm.selected.companyName = vm.selected.profile.companyName;
        vm.selected.countryOfBusiness = vm.selected.profile.countryOfBusiness;
        vm.selected.classifications = vm.selected.profile.classifications;
        vm.selected.URL = vm.selected.profile.URL;
        vm.selected.yearEstablished = vm.selected.profile.yearEstablished;
        vm.selected.description = vm.selected.profile.description;
      }


      vm.sidebar = true;
      vm.head = 'Customers';
      vm.header = 'Customers for ';
      vm.demands = null;
      vm.services = null;
      vm.products = null;

      EnterprisesService.getCustomers({ enterpriseId: obj.selected._id }).then(function(res) {
        vm.list = res.customers;
      });
    }
    function viewCompetitors(obj) {
      vm.selected = obj.selected;

      if (vm.selected.hasOwnProperty('profile')) {
        vm.selected.companyName = vm.selected.profile.companyName;
        vm.selected.countryOfBusiness = vm.selected.profile.countryOfBusiness;
        vm.selected.classifications = vm.selected.profile.classifications;
        vm.selected.URL = vm.selected.profile.URL;
        vm.selected.yearEstablished = vm.selected.profile.yearEstablished;
        vm.selected.description = vm.selected.profile.description;
      }

      vm.sidebar = true;
      vm.head = 'Competitors';
      vm.header = 'Competitors for ';
      vm.demands = null;
      vm.services = null;
      vm.products = null;

      EnterprisesService.getCompetitors({ enterpriseId: obj.selected._id }).then(function(res) {
        vm.list = res.competitors;
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

    function makeGraphForCompany(id) {

    }

  }
}());
