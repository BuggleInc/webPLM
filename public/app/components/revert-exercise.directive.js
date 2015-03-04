(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('revertExercise', revertExercise);
	
	function revertExercise() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/revert-exercise.directive.html'
		};
	}
})();