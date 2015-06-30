(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('exerciseLeftMenu', exerciseLeftMenu);

  exerciseLeftMenu.$inject = ['navigation', 'progLangs'];

  function exerciseLeftMenu(navigation, progLangs) {
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