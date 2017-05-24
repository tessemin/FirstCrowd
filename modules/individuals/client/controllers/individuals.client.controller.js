(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('IndividualsController', IndividualsController);

  IndividualsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'individualResolve'];

  function IndividualsController ($scope, $state, $window, Authentication, individual) {
    var vm = this;

    vm.authentication = Authentication;
    vm.individual = individual;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Individual
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.individual.$remove($state.go('individuals.list'));
      }
    }

    // Save Individual
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.individualForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.individual._id) {
        vm.individual.$update(successCallback, errorCallback);
      } else {
        vm.individual.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('individuals.view', {
          individualId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
