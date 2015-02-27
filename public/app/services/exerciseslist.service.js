(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('exercisesList', exercisesList);
	
	exercisesList.$inject = ['listenersHandler', 'connection'];

	function exercisesList (listenersHandler, connection) {
		var exercisesList;
		var exercisesTree;

		var currentLessonID;
		var currentExerciseID;

		listenersHandler.register('onmessage', connection.setupMessaging(handleMessage));

		var service = {
				getExercisesList: getExercisesList,
				getExercisesTree: getExercisesTree,
				getNextExerciseID: getNextExerciseID,
				setCurrentLessonID: setCurrentLessonID,
				setCurrentExerciseID: setCurrentExerciseID
		};
		
		return service;
		
		function handleMessage(data) {
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
				case 'exercises':
					updateExercisesList(args.exercises);
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
			for(var i=0; i<exercisesList.length - 1; i++) {
				var exercise = exercisesList[i];
				if(currentExerciseID === exercise.id) {
					return exercisesList[i+1].id;
				}
			}
		}

		function setCurrentLessonID (lessonID) {
			if(lessonID !== currentLessonID) {
				currentLessonID = lessonID;
				connection.sendMessage('getExercises', {});
			}
		}

		function setCurrentExerciseID(exerciseID) {
			currentExerciseID = exerciseID;
		}

		function updateExercisesList(exercises) {
			exercisesList = exercises;
			refactorExercisesListAsTree();
		}

		function refactorExercisesListAsTree() {
			var dataMap;
			var treeData;

			// Refactor the exercises list as a tree
			dataMap = exercises.reduce(function(map, node) {
				map[node.name] = node;
			 	return map;
			}, {});
			treeData = [];
			exercises.forEach(function(node) {
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
	}
})();