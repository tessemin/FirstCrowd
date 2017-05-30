(function () {
  'use strict';

  angular
    .module('individuals')
    .controller('ExperienceController', ExperienceController);

  ExperienceController.$inject = ['$scope', '$state', 'IndividualsService', 'Authentication', 'Notification'];

  function ExperienceController ($scope, $state, IndividualsService, Authentication, Notification) {
    var vm = this;

    vm.experiences = [];
    vm.addExperience = addExperience;
    vm.removeExperience = removeExperience;
    
    function addExperience() {
      vm.experiences.push({});
    }
    
    function removeExperience(index) {
      vm.experiences.splice(index, 1);
    }
    
    vm.updateIndividualExperience = updateIndividualExperience;

    // Update a user profile
    function updateIndividualExperience(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.experienceForm');
        Notification.error({ message: 'Fill out required fields!' });
        return false;
      }
      
      IndividualsService.updateExperienceFromForm(vm.experiences)
        .then(onUpdateExperiencesSuccess)
        .catch(onUpdateExperiencesError);
    }
    
    function onUpdateExperiencesSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Work Experience updated!' });
    }
    
    function onUpdateExperiencesError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Work Experience not updated!' });
    }
  }
}());
