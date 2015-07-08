(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('menu', menu);

  menu.$inject = ['navigation', 'progLangs'];

  function menu(navigation, progLangs) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/menu/menu.directive.html',
      link: function (scope, element, attrs) {
        scope.navigation = navigation;
        scope.progLangs = progLangs;
        $(document).foundation('offcanvas', 'reflow');
      }
    };
  }
})();