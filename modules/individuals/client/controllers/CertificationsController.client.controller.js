(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('CertificationsController', CertificationsController);

  CertificationsController.$inject = ['$scope', '$state', 'IndividualsService', 'Authentication', 'Notification'];

  function CertificationsController ($scope, $state, IndividualsService, Authentication, Notification) {
    var vm = this;
    
    // Pull your existing certifications from the server and populate them
    vm.certifications = [];
    IndividualsService.getIndividual().$promise
      .then(function(data) {
        let certs = data.certification;
        for(let i = 0; i < data.certification.length; ++i) {
          vm.certifications.push({});
          vm.certifications[i].certificationName = certs[i].certificationName;
          vm.certifications[i].institution = certs[i].institution;
          vm.certifications[i].dateIssued = new Date(certs[i].dateIssued);
          vm.certifications[i].dateExpired = new Date(certs[i].dateIssued);
          vm.certifications[i].description = certs[i].description;
        }
      });
    
    vm.addCertification = addCertification;
    vm.removeCertification = removeCertification;
    
    function addCertification() {
      vm.certifications.push({});
    }
    
    function removeCertification(index) {
      vm.certifications.splice(index, 1);
    }
    
    vm.updateIndividualCertifications = updateIndividualCertifications;

    // Update a user profile
    function updateIndividualCertifications(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.certificationsForm');
        Notification.error({ message: 'Fill out required fields!' });
        return false;
      }
      
      IndividualsService.updateCertificationsFromForm(vm.certifications)
        .then(onUpdateCertificationsSuccess)
        .catch(onUpdateCertificationsError);
    }
    
    function onUpdateCertificationsSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Certifications updated!' });
    }
    
    function onUpdateCertificationsError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Certifications not updated!' });
    }
  }
}());
