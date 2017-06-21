(function () {
  'use strict';

  angular
    .module('workers')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add my messages Tab
    menuService.addMenuItem('topbar', {
      title: 'My Messages',
      state: 'workers.messages',
      roles: ['worker'],
      userRole: ['worker']
    });
    
    menuService.addMenuItem('topbar', {
      title: 'My Tasks',
      state: 'workers.tasks',
      roles: ['worker'],
      userRole: ['worker']
    });

  }
}());
