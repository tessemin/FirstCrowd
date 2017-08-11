(function () {
  'use strict';

  // EnterpriseCustomer controller
  angular
    .module('enterprises')
    .controller('EnterpriseCustomerController', EnterpriseCustomerController);

  EnterpriseCustomerController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseCustomerController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;
    vm.partners = [];
    vm.updatePartner = updatePartner;
    vm.deletePartner = deletePartner;

    function deletePartner(index) {
      if (vm.partners[index]._id)
        updatePartner(true, index, true);
      else
        Notification.success({ message: 'customer deleted!', title: '<i class="glyphicon glyphicon-ok"></i> Customers updated!' });
      vm.partners.splice(index, 1);
    }
    
    vm.addPartner = function(param) {
      if (param === 'push')
        vm.partners.push({
          URL: '',
          companyName: ''
        });
      else {
        vm.partners.unshift({
          URL: '',
          companyName: ''
        });
      }
    }

    // UpdateCustomers Enterprise
    function updatePartner(isValid, index, deleteItem) {
      if (!deleteItem)
        deleteItem = false;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.customersForm.$index');
        return false;
      }
      EnterprisesService.updateCustomersFromForm({
        customer: vm.partners[index],
        delete: deleteItem
        })
        .then(function(response) {
          if (!deleteItem)
            vm.partners[index] = response.customer;
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Customers updated!' });
        })
        .catch(onUpdateCustomersError);
    }

    function onUpdateCustomersError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Customers not updated!' });
    }

    (function createList() {
      EnterprisesService.getEnterprise()
        .then(function(response) {
          vm.partners = response.partners.customer;
        });
    }())
  }
}());
