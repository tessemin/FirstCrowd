(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService', 'Authentication'];

  function menuConfig(menuService, Authentication) {
    var user = Authentication.user;
    if (user)
      if (user.userRole.length  > 1) { // multiple views to pick from
        menuService.addMenuItem('topbar', {
          title: 'Views',
          state: 'views',
          type: 'dropdown',
          roles: ['*']
        });
        if (user.userRole.indexOf('worker') > -1)
          menuService.addSubMenuItem('topbar', 'views', {
            title: 'Worker View',
            state: 'settings.worker',
            roles: ['*']
          });
          
        if (user.userRole.indexOf('requester') > -1)
          menuService.addSubMenuItem('topbar', 'views', {
            title: 'Requester View',
            state: 'settings.requester',
            roles: ['*']
          });
          
        if (user.userRole.indexOf('resourceOwner') > -1)
          menuService.addSubMenuItem('topbar', 'views', {
            title: 'Resource Owner View',
            state: 'settings.resourceOwner',
            roles: ['*']
          });
        
      } else {
        // a single view to pick from
        if (user.userRole.indexOf('worker') > -1)
          menuService.addMenuItem('topbar', {
            title: 'Worker View',
            state: 'settings.worker',
            roles: ['*']
          });
        else if (user.userRole.indexOf('requester') > -1)
          menuService.addMenuItem('topbar', {
            title: 'Requester View',
            state: 'settings.requester',
            roles: ['*']
          });
         else if (user.userRole.indexOf('resourceOwner') > -1)
          menuService.addMenuItem('topbar', {
            title: 'Resource Owner View',
            state: 'settings.resourceOwner',
            roles: ['*']
          });
      }

    
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
