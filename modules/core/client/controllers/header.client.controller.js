(function () {
  'use strict';
  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'Authentication', 'menuService'];

  function HeaderController($scope, $state, Authentication, menuService, $route) {
    var vm = this;
    
    
    vm.pageType = false;
    if(Authentication.user)
      if (Authentication.user.roles.indexOf('worker') > -1) {
        vm.pageType = 'Worker';
      } else if (Authentication.user.roles.indexOf('requester') > -1) {
        vm.pageType = 'Requester';
      } else if (Authentication.user.roles.indexOf('resourceOwner') > -1) {
        vm.pageType = 'Resource Owner';
      }

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
      
      
    }
    $scope.$on('onMenuRoleChange', function (event, role) {
      if (role) {
        if (role.role === 'worker') {
          vm.pageType = 'Worker';
        } else if (role.role === 'requester') {
          vm.pageType = 'Requester';
        } else if (role.role === 'resourceOwner') {
          vm.pageType = 'Resource Owner';
        } else {
          vm.pageType = false;
        }
      }
    });
  }
}());
