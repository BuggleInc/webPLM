(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('humanLanguages', humanLanguages);

  humanLanguages.$inject = ['langs'];

  function humanLanguages(langs) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/human-languages.directive.html',
      link: function (scope, element, attrs) {
        scope.langs = langs;
        $(document).foundation('dropdown', 'reflow');
      }
    };
  }
})();