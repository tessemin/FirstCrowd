(function () {
  'use strict';

  angular
    .module('individual')
    .controller('IndividualController', IndividualController);

  IndividualController.$inject = ['$scope', 'individualResolve', 'Authentication'];

  function IndividualController($scope, individual, Authentication) {
    var vm = this;

    vm.individual = individual;
    vm.authentication = Authentication;

  }
}());
