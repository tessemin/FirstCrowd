(function () {
  'use strict';

  angular
    .module('articles')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Enterprise Graph',
      state: 'home',
      // type: 'dropdown',
      roles: ['*']
    });
    menuService.addMenuItem('topbar', {
      title: 'List Task',
      state: 'home',
      // type: 'dropdown',
      roles: ['*']
    });
    menuService.addMenuItem('topbar', {
      title: 'Do Task',
      state: 'home',
      // type: 'dropdown',
      roles: ['*']
    });
    menuService.addMenuItem('topbar', {
      title: 'Labor Market',
      state: 'authentication.signup',
      // type: 'dropdown',
      roles: ['*']
    });
    menuService.addMenuItem('topbar', {
      title: 'Resource Market',
      state: 'authentication.signin',
      // type: 'dropdown',
      roles: ['*']
    });
    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'articles', {
    //   title: 'List Articles',
    //   state: 'articles.list',
    //   roles: ['*']
    // });
  }
}());
