(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('profile', profile);

  profile.$inject = ['userService'];
  
  function profile(userService) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/menu/profile.directive.html',
      link: function (scope, element, attrs) {
        scope.userService = userService;
      }
    };
  }
})();