(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('selectProgrammingLanguage', selectProgrammingLanguage);
	
    selectProgrammingLanguage.$inject = ['ide'];
    
	function selectProgrammingLanguage(ide) {
		return {
			restrict: 'E',
            scope: {
                ctrl: '=ctrl'
            },
			templateUrl: '/assets/app/components/select-programming-language.directive.html',
            link: function (scope, element, attrs) {
                scope.ide = ide;
				$(document).foundation('dropdown', 'reflow');
			}
		};
	}
})();