(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('lessonGallery', lessonGallery);
	
	function lessonGallery () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/home/lesson-gallery.directive.html'
		};
	}
})();