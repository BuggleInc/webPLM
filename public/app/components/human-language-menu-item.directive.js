(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('humanLanguageMenuItem', humanLanguageMenuItem);

  function humanLanguageMenuItem() {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/human-language-menu-item.directive.html'
    };
  }
})();