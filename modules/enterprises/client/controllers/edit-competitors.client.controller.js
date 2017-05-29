(function () {
  'use strict';

  // Enterprises controller
  angular
    .module('enterprises')
    .controller('EnterpriseCompetitorController', EnterpriseCompetitorController);

  EnterpriseCompetitorController.$inject = ['$scope', '$state', '$window', 'Authentication', 'UsersService'];

  function EnterpriseCompetitorController ($scope, $state, $window, Authentication, UsersService) {
    var vm = this;

    vm.competitor = Authentication.user;
    vm.saveCompetitor = saveCompetitor;

    // UpdateCompetitor Enterprise
    function saveCompetitor(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.competitorForm');
        return false;
      }

      var user = new UsersService(vm.competitor);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.competitorForm');

        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Edit competitor successful!' });
        Authentication.user = response;
      }, function (response) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Edit competitor failed!' });
      });
    }
  }
}());
