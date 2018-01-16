(function () {
  "use strict";

  angular
    .module('PLMApp')
    .directive('exerciseDone', exerciseDone);

  exerciseDone.$inject = ['progLangs'];

  function exerciseDone(progLangs) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/menu/exercise-done.directive.html',
      scope: {
        exercise: '=exercise'
      },
      link: function (scope, element, attrs) {
        scope.progLangs = progLangs;
      }
    };
  }
})();
