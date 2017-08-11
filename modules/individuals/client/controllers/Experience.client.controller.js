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

    IndividualsService.getIndividual().$promise
      .then(function(data) {
        var work = data.jobExperience;
        data.jobExperience.forEach(function (work, i) {
          addExperience();
          if (work._id)
            vm.experiences[i]._id = work._id.toString();
          vm.experiences[i].employer = work.employer;
          vm.experiences[i].jobTitle = work.jobTitle;
          vm.experiences[i].description = work.description;
          vm.experiences[i].skills = work.skills.join(', ');
          if (work.startDate)
            vm.experiences[i].startDate = new Date(work.startDate);
          if (work.endDate)
            vm.experiences[i].endDate = new Date(work.endDate);
        })
      });

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
