(function () {
  'use strict';

  angular
    .module('core')
    .controller('FooterController', FooterController);

  FooterController.$inject = ['$scope', '$state'];

  function FooterController($scope, $state) {
    var vm = this;

    vm.currentYear = new Date().getFullYear();
  }
}());
