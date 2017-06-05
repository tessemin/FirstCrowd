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
      })
      .catch(function(data) {
        Notification.error({ message: response.data.message, title: 'Error retrieving resume data' });
      });
  }
}());
