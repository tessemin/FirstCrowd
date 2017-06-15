(function () {
  'use strict';

  angular
    .module('workers')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Workers',
      state: 'workers',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'workers', {
      title: 'List Workers',
      state: 'workers.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'workers', {
      title: 'Create Worker',
      state: 'workers.create',
      roles: ['user']
    });
  }
}());
