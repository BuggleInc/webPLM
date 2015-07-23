(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('ide', ide);

	function ide () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/ide.directive.html',
            link: function (scope, element, attrs) {
				$(document).foundation('alert', 'reflow');
			}
		};
	}
})();