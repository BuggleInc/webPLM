(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('humanLanguage', humanLanguage);

  humanLanguage.$inject = ['langs'];

  function humanLanguage(langs) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/menu/human-language.directive.html',
      link: function (scope, element, attrs) {
        scope.langs = langs;
        $(document).foundation('offcanvas', 'reflow');
      }
    };
  }
})();