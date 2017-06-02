(function () {
  'use strict';

  angular
    .module('individuals')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Individuals',
      state: 'individuals',
      type: 'dropdown',
      userRole: 'individual'
    });
    
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'individuals', {
      title: 'Edit Profile',
      state: 'individuals.profile'
    });
  }
}());
