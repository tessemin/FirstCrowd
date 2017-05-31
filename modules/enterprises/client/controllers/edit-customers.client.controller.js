(function () {
  'use strict';

  // EnterpriseCustomer controller
  angular
    .module('enterprises')
    .controller('EnterpriseCustomerController', EnterpriseCustomerController);

  EnterpriseCustomerController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService'];

  function EnterpriseCustomerController ($scope, $state, $window, Authentication, EnterprisesService) {
    var vm = this;

    // vm.customer = Authentication.user.customers;
    vm.saveCustomer = saveCustomer;
    vm.edit = edit;

    vm.customer = [
      {
        companyName: 'jeff',
        URL: 'www.bawls.com'
      },
      {
        companyName: 'yuki',
        URL: 'www.pawlbs.com'
      }
    ];


    vm.selected=null;


    function edit(item){
      vm.selected=item;
    }

    // UpdateCustomers Enterprise
    function saveCustomer(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.customersForm');
        return false;
      }

      EnterprisesService.updateCustomersFromForm(vm.selected)
        .then(onUpdateCustomersSuccess)
        .catch(onUpdateCustomersError);

    }

    function onUpdateCustomersSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Customers updated!' });
    }

    function onUpdateCustomersError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Customers not updated!' });
    }
  }
}());
