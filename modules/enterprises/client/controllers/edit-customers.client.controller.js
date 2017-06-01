(function () {
  'use strict';

  // EnterpriseCustomer controller
  angular
    .module('enterprises')
    .controller('EnterpriseCustomerController', EnterpriseCustomerController);

  EnterpriseCustomerController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseCustomerController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;

    vm.selected = {};
    vm.selectedURL = null;
    vm.selectedCompany = null;
    vm.selectedId = null;

    vm.saveCustomer = saveCustomer;
    vm.edit = edit;
    vm.cancel = cancel;

    vm.customer = [
      {
        _id: 1,
        companyName: 'FACEBOOK',
        URL: 'www.facebook.com'
      },
      {
        _id: 2,
        companyName: 'GOOGLE',
        URL: 'www.google.com'
      }
    ];

    function edit(item) {
      vm.selectedId = item._id;
      vm.selectedURL = item.URL;
      vm.selectedCompany = item.companyName;
    }

    function cancel() {
      vm.selectedId = null;
      vm.selectedURL = null;
      vm.selectedCompany = null;
    }

    // UpdateCustomers Enterprise
    function saveCustomer(isValid) {

      vm.selected._id = vm.selectedId;
      vm.selected.URL = vm.selectedURL;
      vm.selected.companyName = vm.selectedCompany;

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
