(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('worldNonImplemented', worldNonImplemented);
	
	function worldNonImplemented() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/world-non-implemented.directive.html',
			link: function (scope, element, attrs) {
				$(document).foundation('alert', 'reflow');
			}
		};
	}
})();