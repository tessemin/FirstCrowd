(function () {
  'use strict';

  angular
    .module('articles')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
/*     menuService.addMenuItem('topbar', {
      title: 'Requester',
      state: 'home',
      userRole: ['requester'],
      roles: ['*']
    });
    
    menuService.addMenuItem('topbar', {
      title: 'Resource Owner',
      state: 'home',
      // type: 'dropdown',
      userRole: ['resourceOwner'],
      roles: ['*']
    }); */
    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'articles', {
    //   title: 'List Articles',
    //   state: 'articles.list',
    //   roles: ['*']
    // });
  }
}());
