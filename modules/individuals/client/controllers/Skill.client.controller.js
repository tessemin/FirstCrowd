(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('SkillsController', SkillsController);

  SkillsController.$inject = ['$scope', '$state', 'IndividualsService', 'Authentication', 'Notification'];

  function SkillsController ($scope, $state, IndividualsService, Authentication, Notification) {
    var vm = this;
    
    vm.skills = [];
    vm.addSkill = addSkill;
    vm.removeSkill = removeSkill;
    
    IndividualsService.getIndividual().$promise
      .then(function(data) {
        var skills = data.skills;
        for (var i = 0; i < skills.length; ++i) {
          addSkill();
          vm.skills[i].skill = skills[i].skill;
          var date = new Date(skills[i].firstUsed);
          vm.skills[i].firstUsed = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
          date = new Date(skills[i].lastUsed);
          vm.skills[i].lastUsed = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
          vm.skills[i].locationLearned = '';
          if (skills[i].locationLearned.length > 0) {
            vm.skills[i].locationLearned = skills[i].locationLearned[0];
            for (var j = 1; j < skills[i].locationLearned.length; ++j) {
              vm.skills[i].locationLearned += (', ' + skills[i].locationLearned[j]);
            }
          }
        }
      });
    
    function addSkill() {
      vm.skills.push({});
    }
    
    function removeSkill(index) {
      vm.skills.splice(index, 1);
    }
    
    vm.updateIndividualSkills = updateIndividualSkills;

    // Update a user profile
    function updateIndividualSkills(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.skillsForm');
        Notification.error({ message: 'Fill out required fields!' });
        return false;
      }
      
      IndividualsService.updateSkillsFromForm(vm.skills)
        .then(onUpdateSkillsSuccess)
        .catch(onUpdateSkillsError);
    }
    
    function onUpdateSkillsSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Skills updated!' });
    }
    
    function onUpdateSkillsError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Skills not updated!' });
    }
  }
}());
