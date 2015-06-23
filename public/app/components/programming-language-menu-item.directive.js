(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('programmingLanguageMenuItem', programmingLanguageMenuItem);

  function programmingLanguageMenuItem() {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/programming-language-menu-item.directive.html'
    };
  }
})();