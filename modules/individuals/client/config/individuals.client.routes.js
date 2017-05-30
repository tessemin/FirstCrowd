(function () {
  'use strict';

  angular
    .module('individuals')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('individuals', {
        abstract: true,
        url: '/individuals',
        templateUrl: '/modules/individuals/client/views/settings/individuals.client.view.html'
      })
      .state('individuals.profile', {
        url: '/profile',
        templateUrl: '/modules/individuals/client/views/settings/edit-profile.client.view.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Edit Your Account Details'
        }
      })
      .state('individuals.bio', {
        url: '/bio',
        templateUrl: '/modules/individuals/client/views/settings/edit-bio.client.view.html',
        controller: 'BioController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Edit Your Personal Bio'
        }
      })
      .state('individuals.certifications', {
        url: '/certifications',
        templateUrl: '/modules/individuals/client/views/settings/edit-certifications.client.view.html',
        controller: 'CertificationsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Edit Your Certifications'
        }
      })
      .state('individuals.education', {
        url: '/education',
        templateUrl: '/modules/individuals/client/views/settings/edit-education.client.view.html',
        controller: 'EducationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Edit Your Education'
        }
      })
      .state('individuals.experience', {
        url: '/experience',
        templateUrl: '/modules/individuals/client/views/settings/edit-experience.client.view.html',
        controller: 'ExperienceController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Edit Your Work Experience'
        }
      })
      .state('individuals.skills', {
        url: '/skills',
        templateUrl: '/modules/individuals/client/views/settings/edit-skills.client.view.html',
        controller: 'SkillsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Edit your Skills'
        }
      })

      .state('individuals.list', {
        url: '',
        templateUrl: 'modules/individuals/client/views/list-individuals.client.view.html',
        controller: 'IndividualsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Individuals List'
        }
      })
      .state('individuals.create', {
        url: '/create',
        templateUrl: 'modules/individuals/client/views/form-individual.client.view.html',
        controller: 'IndividualsController',
        controllerAs: 'vm',
        resolve: {
          individualResolve: newIndividual
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Individuals Create'
        }
      })
      .state('individuals.edit', {
        url: '/:individualId/edit',
        templateUrl: 'modules/individuals/client/views/form-individual.client.view.html',
        controller: 'IndividualsController',
        controllerAs: 'vm',
        resolve: {
          individualResolve: getIndividual
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Individual {{ individualResolve.name }}'
        }
      })
      .state('individuals.view', {
        url: '/:individualId',
        templateUrl: 'modules/individuals/client/views/view-individual.client.view.html',
        controller: 'IndividualsController',
        controllerAs: 'vm',
        resolve: {
          individualResolve: getIndividual
        },
        data: {
          pageTitle: 'Individual {{ individualResolve.name }}'
        }
      });
  }

  getIndividual.$inject = ['$stateParams', 'IndividualsService'];

  function getIndividual($stateParams, IndividualsService) {
    return IndividualsService.get({
      individualId: $stateParams.individualId
    }).$promise;
  }

  newIndividual.$inject = ['IndividualsService'];

  function newIndividual(IndividualsService) {
    return new IndividualsService();
  }
}());
