(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('applicationHeader', applicationHeader);
	
	applicationHeader.$inject = ['userService'];

	function applicationHeader(userService) {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/application-header.directive.html',
			link: function (scope, element, attrs) {
				scope.userService = userService;
			}
		};
	}
})();