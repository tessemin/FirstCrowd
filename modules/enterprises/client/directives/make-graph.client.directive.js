(function () {
  'use strict';

  angular
    .module('enterprises')
    .directive('makeGraph', makeGraph);

  function makeGraph() {
    return {
      restrict: 'E',
      template: '<div>My First Directive!</div>'
    };
  }
}());
