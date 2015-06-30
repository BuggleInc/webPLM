(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('programmingLanguageMenuItem', programmingLanguageMenuItem);

  function programmingLanguageMenuItem() {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/menu/programming-language.directive.html'
    };
  }
})();