(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('profileMenuItem', profileMenuItem);

  profileMenuItem.$inject = ['userService'];
  
  function profileMenuItem(userService) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/menu/profile.directive.html',
      link: function (scope, element, attrs) {
        scope.userService = userService;
      }
    };
  }
})();