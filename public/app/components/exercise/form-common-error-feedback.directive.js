(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('formCommonErrorFeedback', formCommonErrorFeedback);
	
  formCommonErrorFeedback.$inject = ['commonErrorsFeedback'];
  
	function formCommonErrorFeedback(commonErrorsFeedback) {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/form-common-error-feedback.directive.html',
      link: function (scope, element, attrs) {
        console.log('scope: ', scope);
        scope.commonErrorsFeedback = commonErrorsFeedback;
			}
		};
	}
})();