(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('lessonOverview', lessonOverview);
	
	function lessonOverview () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/home/lesson-overview.directive.html'
		};
	}
})();