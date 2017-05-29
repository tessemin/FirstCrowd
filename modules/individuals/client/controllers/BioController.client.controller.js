(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('BioController', BioController);

  BioController.$inject = ['$scope', '$state', 'UsersService', 'Authentication', 'Notification'];

  function BioController ($scope, $state, UsersService, Authentication, Notification) {
    var vm = this;
    
    vm.user = Authentication.user;
    vm.updateIndividualBio = updateIndividualBio;
    
    // Update a user profile
    function updateIndividualBio(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.bioForm');
        Notification.error({ message: 'Fill out required fields!' });
        return false;
      } else {
        
        var individual = new IndividualsService(vm.user);

        user.$update(function (response) {
          $scope.$broadcast('show-errors-reset', 'vm.bioForm');

          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Bio updated!' });
          // Authentication.user = response;
        }, function (response) {
          Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Bio not updated!' });
        });
      }
    }
  };
}());
