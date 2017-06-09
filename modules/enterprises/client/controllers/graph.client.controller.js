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
        { 'x': 450, 'y': 250 }, { 'x': 450, 'y': 200 }, { 'x': 450, 'y': 180 }, { 'x': 450, 'y': 160 }, { 'x': 450, 'y': 140 }, { 'x': 450, 'y': 120 }, { 'x': 450, 'y': 380 }, { 'x': 450, 'y': 300 }, { 'x': 450, 'y': 320 }, { 'x': 450, 'y': 340 }, { 'x': 450, 'y': 360 },
        // suppliers
        { 'x': 200, 'y': 250 }, { 'x': 190, 'y': 190 }, { 'x': 210, 'y': 285 }, { 'x': 210, 'y': 215 }, { 'x': 180, 'y': 230 }, { 'x': 180, 'y': 270 }, { 'x': 190, 'y': 310 }, { 'x': 210, 'y': 340 }, { 'x': 210, 'y': 160 }, { 'x': 230, 'y': 315 }, { 'x': 230, 'y': 185 },
        // consumers
        { 'x': 700, 'y': 250 }, { 'x': 710, 'y': 190 }, { 'x': 690, 'y': 285 }, { 'x': 690, 'y': 215 }, { 'x': 720, 'y': 230 }, { 'x': 720, 'y': 270 }, { 'x': 710, 'y': 310 }, { 'x': 690, 'y': 340 }, { 'x': 690, 'y': 160 }, { 'x': 670, 'y': 315 }, { 'x': 670, 'y': 185 }
      ],
      'links': [
        { 'source': 1, 'target': 0 }, { 'source': 2, 'target': 0 }, { 'source': 3, 'target': 0 }, { 'source': 4, 'target': 0 }, { 'source': 5, 'target': 0 }, { 'source': 6, 'target': 0 }, { 'source': 7, 'target': 0 }, { 'source': 8, 'target': 0 }, { 'source': 9, 'target': 0 }, { 'source': 10, 'target': 0 }, { 'source': 11, 'target': 0 }, { 'source': 12, 'target': 0 }, { 'source': 13, 'target': 0 }, { 'source': 14, 'target': 0 }, { 'source': 15, 'target': 0 }, { 'source': 16, 'target': 0 }, { 'source': 17, 'target': 0 }, { 'source': 18, 'target': 0 }, { 'source': 19, 'target': 0 }, { 'source': 20, 'target': 0 }, { 'source': 21, 'target': 0 }, { 'source': 22, 'target': 0 }, { 'source': 23, 'target': 0 }, { 'source': 24, 'target': 0 }, { 'source': 25, 'target': 0 }, { 'source': 26, 'target': 0 }, { 'source': 27, 'target': 0 }, { 'source': 28, 'target': 0 }, { 'source': 29, 'target': 0 }, { 'source': 30, 'target': 0 }, { 'source': 31, 'target': 0 }, { 'source': 32, 'target': 0 }
      ]
    };

  }
}());
