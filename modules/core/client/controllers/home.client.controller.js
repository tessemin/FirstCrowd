(function () {
  'use strict';

  angular
    .module('core')
    .controller('carouselCtrl', carouselCtrl);

  function carouselCtrl() {
    $scope.removeFocus = function() {
			if (document.activeElement != document.body) document.activeElement.blur();
		}
  }
  
  
}());

