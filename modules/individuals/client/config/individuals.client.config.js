(function () {
  'use strict';

  angular
    .module('individuals')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Profile',
      state: 'individuals',
      type: 'dropdown',
      roles: ['individual']
    });
    
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'View Your Resume',
      state: 'individuals.resume'
    });
    
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'Edit Account Details',
      state: 'individuals.profile'
    });
    
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'Edit Bio',
      state: 'individuals.bio'
    });
    
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'Edit Education',
      state: 'individuals.education'
    });
    
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'Edit Certifications',
      state: 'individuals.certifications'
    });
    
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'Edit Work Experience',
      state: 'individuals.experience'
    });
    
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'Edit Skills',
      state: 'individuals.skills'
    });
    
    //
    // custom menu items
    //
    menuService.addMenu('individual', {
      title: 'Individuals',
      state: 'individuals',
      type: 'dropdown',
      roles: ['*']
    });
    
    menuService.addMenuItem('individual', {
      title: 'Edit Bio',
      state: 'settings.bio',
      roles: ['individual']
    });
    
    menuService.addMenuItem('individual', {
      title: 'Edit Education',
      state: 'settings.education',
      roles: ['individual']
    });

    menuService.addMenuItem('individual', {
      title: 'Edit Certificatons',
      state: 'settings.certification',
      roles: ['individual']
    });

    menuService.addMenuItem('individual', {
      title: 'Edit Skills',
      state: 'settings.skill',
      roles: ['individual']
    });

    menuService.addMenuItem('individual', {
      title: 'Edit Work Experience',
      state: 'settings.experience',
      roles: ['individual']
    });
  }
}());
