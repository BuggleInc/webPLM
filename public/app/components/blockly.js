(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('blockly', blockly);
	
	function ide () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/blockly.html'
		};
	}
})();