(function () {
  'use strict';

  angular
    .module('users')
    .controller('ExperienceController', ExperienceController);

  ExperienceController.$inject = ['$scope', '$http', '$location', 'UsersService', 'Authentication', 'Notification'];

  function ExperienceController($scope, $http, $location, UsersService, Authentication, Notification) {
    var vm = this;

    vm.individualWorkExperience = Authentication.user;
    vm.updateIndividualWorkExperience = updateIndividualWorkExperience;

    // Update a user profile
    function updateIndividualWorkExperience(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.individualWorkExperience');

        return false;
      }

      var user = new UsersService(vm.individualWorkExperience);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.individualWorkExperienceForm');

        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Edit profile successful!' });
        Authentication.user = response;
      }, function (response) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Edit profile failed!' });
      });
    }
  }
}());
