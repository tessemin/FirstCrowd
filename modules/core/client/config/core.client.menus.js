(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService', 'Authentication'];

  function menuConfig(menuService, Authentication) {

    // adds view picker
    menuService.addMenuItem('topbar', {
      title: 'Views',
      state: 'views',
      type: 'dropdown',
      userRole: ['worker', 'requester', 'resourceOwner']
    });
    menuService.addSubMenuItem('topbar', 'views', {
      title: 'Worker View',
      state: 'worker',
      userRole: ['worker']
    });

    menuService.addSubMenuItem('topbar', 'views', {
      title: 'Requester View',
      state: 'requester',
      userRole: ['requester']
    });

    menuService.addSubMenuItem('topbar', 'views', {
      title: 'Resource Owner View',
      state: 'resourceOwner',
      userRole: ['resourceOwner']
    });


    menuService.addMenu('account', {
      roles: ['user']
    });

    menuService.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile',
      state: 'settings.profile'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile Picture',
      state: 'settings.picture'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Change Password',
      state: 'settings.password'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Manage Social Accounts',
      state: 'settings.accounts'
    });
  }
}());
