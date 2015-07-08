(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('switchExercise', switchExercise);

  switchExercise.$inject = ['exercisesList'];

  function switchExercise(exercisesList) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/menu/switch-exercise.directive.html',
      link: function (scope, element, attrs) {
        scope.exercisesList = exercisesList;
        $(document).foundation('accordion', 'reflow');
      }
    };
  }
})();