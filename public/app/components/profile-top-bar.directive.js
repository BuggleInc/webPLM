(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('profileTopBar', profileTopBar);

  profileTopBar.$inject = ['userService', 'navigation'];
  
  function profileTopBar(userService, navigation) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/profile-top-bar.directive.html',
      link: function (scope, element, attrs) {
        scope.userService = userService;
        scope.navigation = navigation;
      }
    };
  }
})();