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
        if (vm.individual.bio && vm.individual.bio.profession)
          vm.individual.bio.profession = vm.individual.bio.profession.replace(/,(?=[^\s])/g, ', ');
        if (vm.user.phone) {
          vm.user.phone = vm.user.phone.toString();
          var phoneOffset = 0;
          if (vm.user.phone.length === 11) {
            phoneOffset = 1;
          }
          vm.phone = vm.user.phone.slice(0, 3 + phoneOffset) + '-' + vm.user.phone.slice(3 + phoneOffset, 6 + phoneOffset) + '-' + vm.user.phone.slice(6 + phoneOffset);
        }
      })
      .catch(function(data) {
        Notification.error({ message: data.message, title: 'Error retrieving resume data' });
      });
  }
}());
