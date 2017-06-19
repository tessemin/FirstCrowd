(function () {
  'use strict';

  angular
    .module('requesters')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Requesters',
      state: 'requesters',
      type: 'dropdown',
      roles: ['requester']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'requesters', {
      title: 'List Requesters',
      state: 'requesters.list',
      roles: ['requester']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'requesters', {
      title: 'Create Requester',
      state: 'requesters.create',
      roles: ['requester']
    });
  }
}());
