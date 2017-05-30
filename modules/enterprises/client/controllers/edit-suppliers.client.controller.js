(function () {
  'use strict';

  // EnterpriseSupplier controller
  angular
    .module('enterprises')
    .controller('EnterpriseSupplierController', EnterpriseSupplierController);

  EnterpriseSupplierController.$inject = ['$scope', '$state', '$window', 'Authentication', 'UsersService'];

  function EnterpriseSupplierController ($scope, $state, $window, Authentication, UsersService) {
    var vm = this;

    vm.supplier = Authentication.user.suppliers;
    vm.save = save;

    // Save Enterprise
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.supplierForm');
        return false;
      }

      var user = new UsersService(vm.supplier);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.supplierForm');

        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Edit supplier successful!' });
        Authentication.user = response;
      }, function (response) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Edit supplier failed!' });
      });
    }
  }
}());
