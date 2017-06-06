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
      type: 'dropdown',
      roles: ['enterprise']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'enterprises', {
      title: 'Edit your Enterprise',
      state: 'enterprises.profile'
      // roles: ['ent']
    });


    //
    // custom menu items
    //
    menuService.addMenuItem('topbar', {
      title: 'Enterprise Graph',
      state: 'enterprises.graph',
      // type: 'dropdown',
      roles: ['enterprise']
    });

    menuService.addMenu('enterprise', {
      roles: ['*']
    });

    menuService.addMenuItem('enterprise', {
      title: 'Company Profile',
      state: 'enterprises.profile',
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'View Suppliers',
      state: 'enterprises.supplier',
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'View Customers',
      state: 'enterprises.customer',
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'View Competitors',
      state: 'enterprises.competitor',
      roles: ['enterprise']
    });
  }
}());
