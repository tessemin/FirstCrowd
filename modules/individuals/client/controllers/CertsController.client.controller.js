(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('CertsController', CertsController);

  CertsController.$inject = ['$scope', '$state', 'UsersService', 'Authentication', 'Notification'];

  function CertsController ($scope, $state, UsersService, Authentication, Notification) {
    var vm = this;
    
    vm.certs = [];
    vm.addCert = addCert;
    vm.removeCert = removeCert;
    
    function addCert() {
      vm.certs.push({});
    }
    
    function removeCert(index) {
      console.log("Splice index " + index);
      vm.certs.splice(index, 1);
    }

    vm.user = Authentication.user;
    vm.updateIndividualCerts = updateIndividualCerts;

    // Update a user profile
    function updateIndividualCerts(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.certsForm');
        Notification.error({ message: 'Fill out required fields!' });
        return false;
      }

      var user = new UsersService(vm.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.certsForm');

        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Certifications updated!' });
        Authentication.user = response;
      }, function (response) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Certifications not updated!' });
      });
    }
  };
}());
