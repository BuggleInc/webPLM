(function () {
  'use strict';

  angular
    .module('PLMApp')
    .directive('trackUserModal', trackUserModal);

  trackUserModal.$inject = ['userService']

  function trackUserModal(userService) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/track-user-modal.directive.html',
      link: function (scope, element, attrs) {
        $(document).foundation('reveal', 'reflow');
        scope.userService = userService;
        scope.$watch('userService.getUser()', function (data) {
          var user = userService.getUser();
          if (user && user.trackUser === undefined && userService.askTrackUser() === true) {
            $('#trackUserModal').foundation('reveal', 'open');
          }
        });
      }
    };
  }
})();