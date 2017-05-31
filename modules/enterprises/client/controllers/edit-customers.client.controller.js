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
    vm.cancel = cancel;

    vm.customer = [
      {
        companyName: 'FACEBOOK',
        URL: 'www.facebook.com'
      },
      {
        companyName: 'GOOGLE',
        URL: 'www.google.com'
      }
    ];



    function edit(index, item){
      vm.selectedIndex = index;
      vm.selectedURL = item.URL;
      vm.selectedCompany = item.companyName;
    }

    function cancel(){
      vm.selectedIndex = null;
      vm.selectedURL = null;
      vm.selectedCompany = null;
    }

    // UpdateCustomers Enterprise
    function saveCustomer(isValid) {

      if(vm.selectedIndex !== null){
        // vm.customer[vm.selectedIndex]
        console.log(vm.selectedURL + ' ' + vm.selectedCompany);
      }




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
