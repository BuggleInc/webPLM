(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('programmingLanguage', programmingLanguage);

  function programmingLanguage() {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/menu/programming-language.directive.html'
    };
  }
})();