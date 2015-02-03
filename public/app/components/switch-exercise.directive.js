(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('switchExercise', switchExercise);
	
	function switchExercise() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/switch-exercise.directive.html'
		};
	}
})();