(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('resetExercise', resetExercise);
	
	function resetExercise() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/reset-exercise.directive.html',
			link: function (scope, element, attrs) {
				$(document).foundation('reveal', 'reflow');
			}
		};
	}
})();