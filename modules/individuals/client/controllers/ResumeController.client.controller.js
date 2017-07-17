(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('ResumeController', ResumeController);

  ResumeController.$inject = ['$scope', '$state', 'IndividualsService', 'Authentication', 'Notification'];

  function ResumeController ($scope, $state, IndividualsService, Authentication, Notification) {
    var vm = this;
    vm.user = Authentication.user;
    vm.individual = {};

    IndividualsService.getIndividual().$promise
      .then(function(data) {
        vm.individual = data;
        vm.individual.bio.profession = vm.individual.bio.profession.replace(/,(?=[^\s])/g, ", ");
        vm.user.phone = vm.user.phone.toString();
        vm.user.phone = vm.user.phone.slice(0,3) + '-' + vm.user.phone.slice(3,6) + '-' + vm.user.phone.slice(6)
      })
      .catch(function(data) {
        Notification.error({ message: data.message, title: 'Error retrieving resume data' });
      });
  }
}());
