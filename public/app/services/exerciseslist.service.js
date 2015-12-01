(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('exercisesList', exercisesList);

  exercisesList.$inject = ['$rootScope', 'listenersHandler', 'connection'];

  function exercisesList($rootScope, listenersHandler, connection) {
    var exercisesList,
      exercisesTree,
      currentLessonID,
      currentExerciseID,
      service;

    listenersHandler.register('onmessage', handleMessage);

    service = {
      getExercisesList: getExercisesList,
      getExercisesTree: getExercisesTree,
      getNextExerciseID: getNextExerciseID,
      setCurrentLessonID: setCurrentLessonID,
      getCurrentLessonID: getCurrentLessonID,
      setCurrentExerciseID: setCurrentExerciseID,
      getCurrentExerciseID: getCurrentExerciseID,
      isCurrentExerciseAChild: isCurrentExerciseAChild
    };

    return service;

    function handleMessage(data) {
      var cmd,
        args,
        exercise;

      cmd = data.cmd;
      args = data.args;
      switch (cmd) {
      case 'exercise':
        exercise = args.exercise;
        setCurrentExerciseID(exercise.id);
        break;
      case 'lectures':
        updateExercisesList(args.lectures);
        break;
      case 'newHumanLang':
        connection.sendMessage('getExercisesList', { lessonName: currentLessonID });
        break;
      }
    }

    function getExercisesList() {
      return exercisesList;
    }

    function getExercisesTree() {
      return exercisesTree;
    }

    function getNextExerciseID() {
      var i,
        exercise;

      if (exercisesList === undefined) {
        return '';
      }
      for (i = 0; i < exercisesList.length - 1; i++) {
        exercise = exercisesList[i];
        if (currentExerciseID === exercise.id) {
          return exercisesList[i + 1].id;
        }
      }
      return '';
    }

    function setCurrentLessonID(lessonID) {
      if (lessonID !== currentLessonID) {
        currentLessonID = lessonID;
        connection.sendMessage('getExercisesList', { lessonName: currentLessonID });
      }
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

    function addExerciseAndChildrenToList(exercise) {
      var i;

      exercisesList.push(exercise);
      for (i = 0; i < exercise.dependingLectures.length; i++) {
        addExerciseAndChildrenToList(exercise.dependingLectures[i]);
      }
    }

    function refactorExercisesTreeAsList() {
      var i, exercise;

      exercisesList = [];
      for (i = 0; i < exercisesTree.length; i++) {
        exercise = exercisesTree[i];
        addExerciseAndChildrenToList(exercise);
      }
    }

    function updateExercisesList(exercises) {
      exercisesTree = exercises;
      refactorExercisesTreeAsList();
    }

    function isCurrentExerciseAChild(rootLecture) {
      var i;
      if (rootLecture.id === currentExerciseID) {
        return true;
      }
      if (rootLecture.dependingLectures) {
        for (i = 0; i < rootLecture.dependingLectures.length; i++) {
          if (rootLecture.dependingLectures[i].id === currentExerciseID) {
            return true;
          }
        }
      }
      return false;
    }
  }
}());
