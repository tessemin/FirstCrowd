(function () {
  'use strict';

  angular
    .module('requesters')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add my messages Tab
    menuService.addMenuItem('topbar', {
      title: 'My Messages',
      state: 'requesters.messages',
      roles: ['requester'],
      userRole: ['requester']
    });
    
    menuService.addMenuItem('topbar', {
      title: 'My Tasks',
      state: 'requesters.tasks',
      roles: ['requester'],
      userRole: ['requester']
    });
  }
}());
