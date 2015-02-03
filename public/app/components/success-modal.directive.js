(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('successModal', successModal);
	
	function successModal () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/success-modal.directive.html'
		};
	}
})();