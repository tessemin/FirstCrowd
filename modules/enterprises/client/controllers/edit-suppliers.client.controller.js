(function () {
  'use strict';

  // EnterpriseSupplier controller
  angular
    .module('enterprises')
    .controller('EnterpriseSupplierController', EnterpriseSupplierController);

  EnterpriseSupplierController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseSupplierController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;

    vm.selected = {};
    vm.selectedURL = null;
    vm.selectedCompany = null;
    vm.selectedId = null;

    vm.saveSupplier = saveSupplier;
    vm.edit = edit;
    vm.cancel = cancel;

    createList();

    function edit(item) {
      vm.company = item.companyName;
      vm.selectedId = item._id;
      vm.selectedURL = item.URL;
      vm.selectedCompany = item.companyName;
    }

    function cancel() {
      vm.selectedId = null;
      vm.selectedURL = null;
      vm.selectedCompany = null;
    }

    // UpdateSuppliers Enterprise
    function saveSupplier(isValid) {

      vm.selected._id = vm.selectedId;
      vm.selected.URL = vm.selectedURL;
      vm.selected.companyName = vm.selectedCompany;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.suppliersForm');
        return false;
      }

      EnterprisesService.updateSuppliersFromForm(vm.selected)
        .then(onUpdateSuppliersSuccess)
        .catch(onUpdateSuppliersError);
    }

    function onUpdateSuppliersSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Suppliers updated!' });
      createList();
      cancel();
    }

    function onUpdateSuppliersError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Suppliers not updated!' });
      createList();
    }

    function createList() {
      EnterprisesService.getEnterprise()
        .then(function(response) {
          vm.supplier = response.partners.supplier;
        });
    }
  }
}());
