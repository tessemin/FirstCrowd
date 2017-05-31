// Individuals service used to communicate Individuals REST endpoints
(function () {
  'use strict';

  angular
    .module('individuals')
    .factory('IndividualsService', IndividualsService);

  IndividualsService.$inject = ['$resource'];

  function IndividualsService($resource) {
    var Individuals = $resource('api/individuals/:individualId', {
      individualId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      updateCertifications: {
        method: 'POST',
        url: 'api/individuals/certifications/'
      },
      updateExperiences: {
        method: 'POST',
        url: 'api/individuals/experiences/'
      },
      updateSkills: {
        method: 'POST',
        url: 'api/individuals/skills/'
      },
      updateEducation: {
        method: 'POST',
        url: 'api/individuals/education/'
      },
      updateBio: {
        method: 'POST',
        url: 'api/individuals/bio'
      },
      getIndividual: {
        method: 'GET',
        url: 'api/individuals/getIndividual'
      }
    });
    
    angular.extend(Individuals, {
      updateCertificationsFromForm: function (certifications) {
        return this.updateCertifications(certifications).$promise;
      },
      updateExperienceFromForm: function (experiences) {
        return this.updateExperiences(experiences).$promise;
      },
      updateSkillsFromForm: function (skills) {
        return this.updateSkills(skills).$promise;
      },
      updateEducationFromForm: function (degrees) {
        return this.updateEducation(degrees).$promise;
      },
      updateBioFromForm: function (bio) {
        return this.updateBio(bio).$promise;
      }
    });
    
    return Individuals;
  }
}());
