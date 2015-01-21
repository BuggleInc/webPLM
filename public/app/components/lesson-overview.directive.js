(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('lessonOverview', lessonOverview);
	
	function lessonOverview () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/lesson-overview.directive.html'
		};
	}
})();