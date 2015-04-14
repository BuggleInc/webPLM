(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('worldEditionCommands', worldEditionCommands);
	
	function worldEditionCommands() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/world-edition-commands.directive.html'
		};
	}
})();