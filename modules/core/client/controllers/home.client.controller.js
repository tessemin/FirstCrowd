(function () {
  'use strict';

  angular
    .module('core')
    .controller('carouselCtrl', carouselCtrl);
  carouselCtrl.$inject = ['$scope'];

  function carouselCtrl($scope) {
    var vm = this;
    vm.currentYear = new Date().getFullYear();
    $scope.removeFocus = function() {
      if (document.activeElement !== document.body) document.activeElement.blur();
    };
  }
}());
