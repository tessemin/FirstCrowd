(function () {
  'use strict';

  angular
    .module('enterprises')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Enterprises',
      state: 'enterprises',
      type: 'dropdown'
      // roles: ['ent']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'enterprises', {
      title: 'List Enterprises',
      state: 'enterprises.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'enterprises', {
      title: 'Create Enterprise',
      state: 'enterprises.create'
      // roles: ['ent']
    });



    //
    // custom menu items
    //
    menuService.addMenu('enterprise',{
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'CoProfile',
      state: 'enterprises.create',
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'Company Profile',
      state: 'enterprises.create',
      roles: ['enterprise'],
      position: 1
    });



  }
}());
