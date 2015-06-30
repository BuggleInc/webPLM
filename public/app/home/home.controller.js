(function () {
  'use strict';

  angular
    .module('PLMApp')
    .controller('Home', Home);

  Home.$inject = ['$http', '$scope', '$state', '$sce', 'langs', 'connection', 'listenersHandler', 'navigation', 'gettextCatalog'];

  function Home($http, $scope, $state, $sce, langs, connection, listenersHandler, navigation, gettextCatalog) {
    var home = this;

    home.lessons = [];
    home.currentLesson = null;
    home.currentExerciseID = '';

    home.getLessons = getLessons;
    home.setLessons = setLessons;
    home.setCurrentLesson = setCurrentLesson;
    home.goToLesson = goToLesson;

    navigation.setCurrentPageTitle(gettextCatalog.getString('Home'));

    var offHandleMessage = listenersHandler.register('onmessage', handleMessage);

    getLessons();

    function handleMessage(data) {
      var cmd = data.cmd;
      var args = data.args;

      console.log('message received: ', data);
      switch (cmd) {
      case 'lessons':
      case 'newHumanLang':
        setLessons(args.lessons);
        break;
      }
    }

    function getLessons() {
      connection.sendMessage('getLessons', null);
    }

    function setLessons(lessons) {
      home.lessons = lessons.map(function (lesson) {
        lesson.description = $sce.trustAsHtml(lesson.description);
        return lesson;
      });
      home.currentLesson = null;
      console.log('updated home.lessons: ', home.lessons);
    }

    function setCurrentLesson(lesson) {
      home.currentLesson = lesson;
    }

    function goToLesson() {
      $state.go('exercise', {
        'lessonID': home.currentLesson.id
      });
    }

    $scope.$on('$destroy', function () {
      offHandleMessage();
    });
  }
})();