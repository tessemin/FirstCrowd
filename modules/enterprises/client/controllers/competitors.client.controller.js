(function () {
  'use strict';

  // Enterprises controller
  angular
    .module('enterprises')
    .controller('EnterpriseCompetitorController', EnterpriseCompetitorController);

  EnterprisesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'enterpriseResolve'];

  function EnterprisesController ($scope, $state, $window, Authentication, enterprise) {
    var vm = this;

    vm.authentication = Authentication;
    vm.enterprise = enterprise;
    vm.error = null;
    vm.form = {};
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
        $scope.$broadcast('show-errors-check-validity', 'vm.form.enterpriseForm');
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
