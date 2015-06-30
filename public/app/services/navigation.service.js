(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('navigation', navigation);

  function navigation() {
    var currentPageTitle = 'Home';
    var inLesson = false;

    var service = {
      setCurrentPageTitle: setCurrentPageTitle,
      getCurrentPageTitle: getCurrentPageTitle,
      setInlesson: setInLesson,
      isInLesson: isInLesson
    };

    return service;

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