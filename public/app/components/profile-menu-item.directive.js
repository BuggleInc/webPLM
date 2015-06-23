(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('profileMenuItem', profileMenuItem);

  function profileMenuItem() {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/profile-menu-item.directive.html'
    };
  }
})();