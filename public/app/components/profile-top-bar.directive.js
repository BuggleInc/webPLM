(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('profileTopBar', profileTopBar);

  profileTopBar.$inject = ['userService'];
  
  function profileTopBar(userService) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/profile-top-bar.directive.html',
      link: function (scope, element, attrs) {
        scope.userService = userService;
      }
    };
  }
})();