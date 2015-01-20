(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('lessonOverview', lessonOverview);
	
	function lessonOverview () {
		return {
			restrict: 'E',
			templateUrl: '/assets/components/lesson-overview.directive.html'
		};
	}
})();