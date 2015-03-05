(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('revertExercise', revertExercise);
	
	function revertExercise() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/revert-exercise.directive.html',
			link: function (scope, element, attrs) {
				$(document).foundation('reveal', 'reflow');
			}
		};
	}
})();