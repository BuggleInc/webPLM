(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('worldsView', worldsView);
	
	function worldsView() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/worlds-view.directive.html',
			link: function (scope, element, attrs) {
				scope.$on('newLangSelected', function () {
					$(document).foundation('tooltip', 'reflow');
				});
			}
		};
	}
})();