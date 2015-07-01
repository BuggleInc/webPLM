(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('programmingLanguages', programmingLanguages);

  programmingLanguages.$inject = ['progLangs'];
  
  function programmingLanguages(progLangs) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/programming-languages.directive.html',
      link: function (scope, element, attrs) {
        scope.progLangs = progLangs;
				$(document).foundation('dropdown', 'reflow');
			}
    };
  }
})();