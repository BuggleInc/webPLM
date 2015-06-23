(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('switchExerciseMenuItem', switchExerciseMenuItem);

  function switchExerciseMenuItem() {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/switch-exercise-menu-item.directive.html'
    };
  }
})();