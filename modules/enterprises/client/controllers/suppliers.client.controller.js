(function () {
  'use strict';

  // EnterpriseSupplier controller
  angular
    .module('enterprises')
    .controller('EnterpriseSupplierController', EnterpriseSupplierController);

  EnterpriseSupplierController.$inject = ['$scope', '$state', '$window', 'Authentication'];

  function EnterpriseSupplierController ($scope, $state, $window, Authentication) {
    var vm = this;

    vm.authentication = Authentication;
    // vm.enterprise = enterprise;
    vm.error = null;
    vm.supplierForm = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Enterprise
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.enterprise.$remove($state.go('enterprises.list'));
      }
    }

    // Save Enterprise
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.supplierForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.enterprise._id) {
        vm.enterprise.$update(successCallback, errorCallback);
      } else {
        vm.enterprise.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('enterprises.view', {
          enterpriseId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
