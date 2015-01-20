(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('lessonGallery', lessonGallery);
	
	function lessonGallery () {
		return {
			restrict: 'E',
			templateUrl: '/assets/components/lesson-gallery.directive.html'
		};
	}
})();