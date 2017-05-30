(function () {
  'use strict';

  // EnterpriseCustomer controller
  angular
    .module('enterprises')
    .controller('EnterpriseCustomerController', EnterpriseCustomerController);

  EnterpriseCustomerController.$inject = ['$scope', '$state', '$window', 'Authentication', 'UsersService'];

  function EnterpriseCustomerController ($scope, $state, $window, Authentication, UsersService) {
    var vm = this;

    // vm.customer = Authentication.user.customers;
    vm.saveCustomer = saveCustomer;

    vm.customer = [
      {
        companyName: 'jeff',
        website: 'www.bawls.com'
      },
      {
        companyName: 'yuki',
        website: 'www.pawlbs.com'
      }
    ];

    // Update a user customer
    function saveCustomer(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.customerForm');

        return false;
      }

      var user = new UsersService(vm.customer);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.customerForm');

        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Edit customer successful!' });
        Authentication.user = response;
      }, function (response) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Edit customer failed!' });
      });
    }
  }
}());
