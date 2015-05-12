(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('trackUserModal', trackUserModal);
	
	trackUserModal.$inject = ['userService']

	function trackUserModal (userService) {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/track-user-modal.directive.html',
			link: function (scope, element, attrs) {
				$(document).foundation('reveal', 'reflow');
				scope.userService = userService;
				scope.$watch('userService.getUser()', function (data) {
					console.log('Yo dans le watch');
					var user = scope.userService.getUser();
					if(Object.keys(user).length !== 0 && user.trackUser === undefined) {
						$('#trackUserModal').foundation('reveal','open');
					}
				});
			}
		};
	}
})();