(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('CertificationsController', CertificationsController);

  CertificationsController.$inject = ['$scope', '$state', 'UsersService', 'Authentication', 'Notification'];

  function CertificationsController ($scope, $state, UsersService, Authentication, Notification) {
    var vm = this;
    
    vm.certifications = [];
    vm.addCertification = addCertification;
    vm.removeCertification = removeCertification;
    
    function addCertification() {
      vm.certifications.push({});
    }
    
    function removeCertification(index) {
      vm.certifications.splice(index, 1);
    }

    vm.user = Authentication.user;
    vm.updateIndividualCertifications = updateIndividualCertifications;

    // Update a user profile
    function updateIndividualCertifications(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.certificationsForm');
        Notification.error({ message: 'Fill out required fields!' });
        return false;
      }

      var user = new UsersService(vm.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.certificationsForm');

        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Certifications updated!' });
        Authentication.user = response;
      }, function (response) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Certifications not updated!' });
      });
    }
  };
}());
