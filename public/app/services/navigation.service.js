(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('navigation', navigation);

  navigation.$inject = ['listenersHandler']

  function navigation(listenersHandler) {
    var currentPageTitle = 'Home';
    var inLesson = false;
    var ready = false;

    listenersHandler.register('onmessage', handleMessage);

    var service = {
      setCurrentPageTitle: setCurrentPageTitle,
      getCurrentPageTitle: getCurrentPageTitle,
      isReady: isReady,
      setInlesson: setInLesson,
      isInLesson: isInLesson
    };

    return service;

    function handleMessage(data) {
      var cmd, args;
      cmd = data.cmd;
      args = data.args;
      switch (cmd) {
        case 'ready':
          ready = true;
          break;
      }
    }

    function isReady() {
      return ready;
    }

    function setCurrentPageTitle(pageTitle) {
      currentPageTitle = pageTitle;
    }

    function getCurrentPageTitle() {
      return currentPageTitle;
    }

    function setCurrentLessonID(lessonID) {
      currentLessonID = lessonID;
    }

    function getCurrentLessonID() {
      return currentLessonID;
    }

    function setCurrentExerciseID(exerciseID) {
      currentExerciseID = exerciseID;
    }

    function getCurrentExerciseID() {
      return currentExerciseID;
    }

    function setInLesson(boolean) {
      inLesson = boolean;
    }
    
    function isInLesson() {
      return inLesson;
    }
  }
})();