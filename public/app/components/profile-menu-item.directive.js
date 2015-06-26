(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('profileMenuItem', profileMenuItem);

  profileMenuItem.$inject = ['userService'];
  
  function profileMenuItem(userService) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/profile-menu-item.directive.html',
      link: function (scope, element, attrs) {
        scope.userService = userService;
      }
    };
  }
})();