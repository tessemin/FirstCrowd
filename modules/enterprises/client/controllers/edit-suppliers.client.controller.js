(function () {
  'use strict';

  // EnterpriseSupplier controller
  angular
    .module('enterprises')
    .controller('EnterpriseSupplierController', EnterpriseSupplierController);

  EnterpriseSupplierController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService'];

  function EnterpriseSupplierController ($scope, $state, $window, Authentication, EnterprisesService) {
    var vm = this;

    vm.supplier = Authentication.user.suppliers;
    vm.saveSuppliers = saveSuppliers;
    vm.edit = edit;

    vm.supplier = [
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

    // UpdateSuppliers Enterprise
    function saveSuppliers(isValid) {
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
    }

    function onUpdateSuppliersError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Suppliers not updated!' });
    }
  }
}());
