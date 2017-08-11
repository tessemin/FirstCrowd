(function () {
  'use strict';

  // EnterpriseSupplier controller
  angular
    .module('enterprises')
    .controller('EnterpriseSupplierController', EnterpriseSupplierController);

  EnterpriseSupplierController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseSupplierController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;
    vm.partners = [];
    vm.updatePartner = updatePartner;
    vm.deletePartner = deletePartner;

    function deletePartner(index) {
      if (vm.partners[index]._id)
        updatePartner(true, index, true);
      else
        Notification.success({ message: 'supplier deleted!', title: '<i class="glyphicon glyphicon-ok"></i> Suppliers updated!' });
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

    // UpdateSuppliers Enterprise
    function updatePartner(isValid, index, deleteItem) {
      if (!deleteItem)
        deleteItem = false;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.suppliersForm.$index');
        return false;
      }
      EnterprisesService.updateSuppliersFromForm({
        supplier: vm.partners[index],
        delete: deleteItem
        })
        .then(function(response) {
          if (!deleteItem)
            vm.partners[index] = response.supplier;
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Suppliers updated!' });
        })
        .catch(onUpdateSuppliersError);
    }

    function onUpdateSuppliersError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Suppliers not updated!' });
    }

    (function createList() {
      EnterprisesService.getEnterprise()
        .then(function(response) {
          vm.partners = response.partners.supplier;
        });
    }())
  }
}());
