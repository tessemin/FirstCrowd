(function () {
  'use strict';

  // Workers controller
  angular
    .module('workers')
    .controller('WorkersController', WorkersController);

  WorkersController.$inject = ['$scope', '$state', '$window', 'Authentication', 'workerResolve'];

  function WorkersController ($scope, $state, $window, Authentication, worker) {
    var vm = this;

    vm.authentication = Authentication;
    vm.worker = worker;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Worker
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.worker.$remove($state.go('workers.list'));
      }
    }

    // Save Worker
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.workerForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.worker._id) {
        vm.worker.$update(successCallback, errorCallback);
      } else {
        vm.worker.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('workers.view', {
          workerId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
