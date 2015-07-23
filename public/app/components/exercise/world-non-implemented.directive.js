(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('worldNonImplemented', worldNonImplemented);
	
	function worldNonImplemented() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/world-non-implemented.directive.html',
			link: function (scope, element, attrs) {
				scope.$on('newLangSelected', function () {
					$(document).foundation('alert', 'reflow');
				});
			}
		};
	}
})();