(function () {
  'use strict';

  // Requesters controller
  angular
    .module('requesters')
    .controller('RequestersController', RequestersController);

  RequestersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'requesterResolve'];

  function RequestersController ($scope, $state, $window, Authentication, requester) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = vm.authentication.user;
    vm.requester = requester;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Requester
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.requester.$remove($state.go('requesters.list'));
      }
    }

    // Save Requester
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.requesterForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.requester._id) {
        vm.requester.$update(successCallback, errorCallback);
      } else {
        vm.requester.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('requesters.view', {
          requesterId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
