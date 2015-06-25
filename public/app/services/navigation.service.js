(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('navigation', navigation);

  function navigation() {
    var currentPageTitle = 'Home';
    var currentLessonID = '';
    var currentExerciseID = '';

    var service = {
      setCurrentPageTitle: setCurrentPageTitle,
      getCurrentPageTitle: getCurrentPageTitle,
      setCurrentLessonID: setCurrentLessonID,
      getCurrentLessonID: getCurrentLessonID,
      setCurrentRootLectureID: setCurrentRootLectureID,
      getCurrentRootLectureID: getCurrentRootLectureID,
      setCurrentExerciseID: setCurrentExerciseID,
      getCurrentExerciseID: getCurrentExerciseID,
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

    function setCurrentRootLectureID(rootLectureID) {
      currentRootLectureID = rootLectureID;
    }

    function getCurrentRootLectureID() {
      return currentRootLectureID;
    }

    function setCurrentExerciseID(exerciseID) {
      currentExerciseID = exerciseID;
    }

    function getCurrentExerciseID() {
      return currentExerciseID;
    }

    function isInLesson() {
      return currentLessonID !== '';
    }
  }
})();