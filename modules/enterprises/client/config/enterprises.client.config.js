(function () {
  'use strict';

  angular
    .module('enterprises')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    // menuService.addMenuItem('topbar', {
    //   title: 'Enterprises',
    //   state: 'enterprises',
    //   type: 'dropdown',
    //   roles: ['enterprise']
    // });

    // Add the dropdown create item
    // menuService.addSubMenuItem('account', 'settings', {
    //   title: 'Edit Company Profile',
    //   state: 'enterprises.profile',
    //   roles: ['enterprise']
    // });
    
    // menuService.addSubMenuItem('account', 'settings', {
    //   title: 'Edit Suppliers',
    //   state: 'enterprises.supplier',
    //   roles: ['enterprise']
    // });
    
    // menuService.addSubMenuItem('account', 'settings', {
    //   title: 'Edit Customers',
    //   state: 'enterprises.customer',
    //   roles: ['enterprise']
    // });
    
    // menuService.addSubMenuItem('account', 'settings', {
    //   title: 'Edit Competitors',
    //   state: 'enterprises.competitor',
    //   roles: ['enterprise']
    // });

    //
    // custom menu items
    //
    menuService.addMenuItem('topbar', {
      title: 'Company Recommendations',
      state: 'recommendations',
      roles: ['enterprise']
    });

    menuService.addMenu('enterprise', {
      title: 'Enterprise',
      state: 'enterprises',
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'Company Profile',
      state: 'enterprises.profile',
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'Company Suppliers',
      state: 'enterprises.supplier',
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'Company Customers',
      state: 'enterprises.customer',
      roles: ['enterprise']
    });

    menuService.addMenuItem('enterprise', {
      title: 'Company Competitors',
      state: 'enterprises.competitor',
      roles: ['enterprise']
    });
  }
}());
