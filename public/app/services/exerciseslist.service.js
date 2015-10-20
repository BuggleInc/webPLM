(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('exercisesList', exercisesList);

  exercisesList.$inject = ['$rootScope', 'listenersHandler', 'connection'];

  function exercisesList($rootScope, listenersHandler, connection) {
    var exercisesList;
    var exercisesTree;

    var currentLessonID;
    var currentExerciseID;

    listenersHandler.register('onmessage', handleMessage);

    var service = {
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
      var cmd = data.cmd;
      var args = data.args;
      switch (cmd) {
        case 'exercise':
          var exercise = args.exercise;
          setCurrentExerciseID(exercise.id);
          break;
      case 'exercises':
        updateExercisesList(args.exercises);
        break;
      case 'newHumanLang':
        connection.sendMessage('getExercises', {});
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
      if(exercisesList === undefined) {
        return '';
      }
      for (var i = 0; i < exercisesList.length - 1; i++) {
        var exercise = exercisesList[i];
        if (currentExerciseID === exercise.id) {
          return exercisesList[i + 1].id;
        }
      }
      return '';
    }

    function setCurrentLessonID(lessonID) {
      if (lessonID !== currentLessonID) {
        currentLessonID = lessonID;
        connection.sendMessage('getExercises', {});
      } else {
        $rootScope.$broadcast('exercisesListReady');
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

    function updateExercisesList(exercises) {
      exercisesList = exercises;
      refactorExercisesListAsTree();
      $rootScope.$broadcast('exercisesListReady');
    }

    function refactorExercisesListAsTree() {
      var dataMap;
      var treeData;

      // Refactor the exercises list as a tree
      dataMap = exercisesList.reduce(function (map, node) {
        map[node.name] = node;
        return map;
      }, {});
      treeData = [];
      exercisesList.forEach(function (node) {
        // add to parent
        var parent = dataMap[node.parent];
        if (parent) {
          // create child array if it doesn't exist
          (parent.children || (parent.children = []))
          // add node to child array
          .push(node);
        } else {
          // parent is null or missing
          treeData.push(node);
        }
      });
      exercisesTree = treeData;
    }

    function isCurrentExerciseAChild(rootLecture) {
      var i;
      if (rootLecture.id === currentExerciseID) {
        return true;
      }
      else if(rootLecture.children) {
        for (i = 0; i < rootLecture.children.length; i++) {
          if (rootLecture.children[i].id === currentExerciseID) {
            return true;
          }
        }
      }
      return false;
    }
  }
})();