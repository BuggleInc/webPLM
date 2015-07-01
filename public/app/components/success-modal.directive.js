(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('successModal', successModal);
	
  successModal.$inject = ['exercisesList'];
  
	function successModal (exercisesList) {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/success-modal.directive.html',
			link: function (scope, element, attrs) {
        scope.exercisesList = exercisesList;
				$(document).foundation('reveal', 'reflow');
			}
		};
	}
})();