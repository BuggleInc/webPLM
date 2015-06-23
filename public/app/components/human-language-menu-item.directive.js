(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('humanLanguageMenuItem', humanLanguageMenuItem);

  humanLanguageMenuItem.$inject = ['langs'];

  function humanLanguageMenuItem(langs) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/human-language-menu-item.directive.html',
      link: function (scope, element, attrs) {
        scope.langs = langs;
        $(document).foundation('offcanvas', 'reflow');
      }
    };
  }
})();