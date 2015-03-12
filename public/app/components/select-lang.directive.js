(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('selectLang', selectLang);
	
	selectLang.$inject = ['langs'];

	function selectLang(langs) {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/select-lang.directive.html',
			link: function (scope, element, attrs) {
				scope.langs = langs;
				$(document).foundation('dropdown', 'reflow');
			}
		};
	}
})();