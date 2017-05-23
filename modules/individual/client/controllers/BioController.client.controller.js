(function () {
  'use strict';

  angular
    .module('users')
    .controller('BioController', BioController);

  BioController.$inject = ['$scope', '$location', 'UsersService', 'Authentication', 'Notification'];

  $('#DATEOFBIRTHTEST input').datepicker({
    autoclose: true
  });


  function BioController($scope, UsersService, Authentication, Notification) {
    var vm = this;
  }
}());
