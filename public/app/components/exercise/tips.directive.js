(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('tips', tips);

  function tips() {
    return {
      restrict: 'E',
      scope: {},
      transclude: true,
      templateUrl: '/assets/app/components/exercise/tips.directive.html',
      link: function (scope, element, attrs) {
        console.log('attrs: ', attrs);
        scope.displayTip = false;
        scope.readTip = false;
        scope.tipID = attrs.tipid;
        scope.title = attrs.title;
        scope.showTip = showTip;
        $(document).foundation('accordion', 'reflow');
      }
    };
  }

  function showTip() {
    this.displayTip = !this.displayTip;
    if(!this.readTip) {
      this.readTip = true;
      console.log('On passe bien ici qu\'une seule fois!');
      //exercise.readTip($scope.tipID);
    }
  }
})();
