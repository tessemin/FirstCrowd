(function () {
  'use strict';

  // Enterprises controller
  angular
    .module('enterprises')
    .controller('EnterpriseGraphController', EnterpriseGraphController);

  EnterpriseGraphController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseGraphController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;

    vm.data = {
      'nodes': [
        // competitors
      { 'x': 450, 'y': 200 }, { 'x': 450, 'y': 160 }, { 'x': 450, 'y': 120 }, { 'x': 450, 'y': 80 }, { 'x': 450, 'y': 40 }, { 'x': 450, 'y': 440 }, { 'x': 450, 'y': 240 }, { 'x': 450, 'y': 280 }, { 'x': 450, 'y': 320 }, { 'x': 450, 'y': 360 }, { 'x': 450, 'y': 400 },
        // suppliers
        { 'x': 200, 'y': 100 }, { 'x': 180, 'y': 120 }, { 'x': 502, 'y': 287 }, { 'x': 511, 'y': 313 }, { 'x': 513, 'y': 265 }, { 'x': 602, 'y': 132 }, { 'x': 610, 'y': 90 }, { 'x': 592, 'y': 91 }, { 'x': 575, 'y': 89 },
        // consumers
        { 'x': 607, 'y': 73 }, { 'x': 591, 'y': 68 }, { 'x': 574, 'y': 73 }, { 'x': 589, 'y': 149 }, { 'x': 620, 'y': 205 }, { 'x': 621, 'y': 230 }, { 'x': 589, 'y': 234 }, { 'x': 627, 'y': 355 }
      ],
      'links': [
        { 'source': 1, 'target': 0 }, { 'source': 2, 'target': 0 }, { 'source': 3, 'target': 0 }, { 'source': 4, 'target': 0 }, { 'source': 5, 'target': 0 }, { 'source': 6, 'target': 0 }, { 'source': 7, 'target': 0 }, { 'source': 8, 'target': 0 }, { 'source': 9, 'target': 0 }, { 'source': 10, 'target': 0 }
      ]
    };

  }
}());
