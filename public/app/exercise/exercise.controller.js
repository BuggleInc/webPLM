(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Exercise', Exercise);
	
	Exercise.$inject = ['$http', '$scope', '$sce', '$stateParams', 'locker', 'connection', 
	'listenersHandler', 'canvas', 'DefaultColors', 'OutcomeKind', 'BuggleWorld'];

	function Exercise($http, $scope, $sce, $stateParams, locker, connection, listenersHandler, canvas, DefaultColors, OutcomeKind, BuggleWorld) {
		var exercise = this;
		
		exercise.lessonID = $stateParams.lessonID;
		exercise.id = $stateParams.exerciseID;
		
		exercise.display = 'instructions';
		
		exercise.isRunning = false;
		exercise.isPlaying = false;
		exercise.isChangingProgLang = false;
		exercise.playedDemo = false;

		exercise.instructions = null;
		exercise.api = null;
		exercise.resultType = null;
		exercise.resultMsg = null;
		exercise.logs = '';
		
		exercise.initialWorlds = {};
		exercise.answerWorlds = {};
		exercise.currentWorlds = {};
		exercise.currentWorld = null;
		exercise.currentWorldID = null;
		exercise.worldKind = 'current';
		exercise.worldIDs = []; // Mandatory to generate dynamically the select
		exercise.updateViewLoop = null;
		
		locker.bind($scope, 'timer', 1000);
		exercise.timer = locker.get('timer');

		exercise.currentState = -1;
		
		exercise.currentProgrammingLanguage = null;
		exercise.programmingLanguages = [];

		exercise.editor = null;

		exercise.exercisesAsList = null;
		exercise.exercisesAsTree = null;
		exercise.defaultNextExercise = null;
		exercise.selectedRootLecture = null;
		exercise.selectedNextExercise = null;
		
		exercise.runDemo = runDemo;
		exercise.runCode = runCode;
		exercise.reset = reset;
		exercise.replay = replay;
		exercise.stopExecution = stopExecution;
		exercise.setWorldState = setWorldState;
		exercise.setCurrentWorld = setCurrentWorld;
		exercise.setProgrammingLanguage = setProgrammingLanguage;
		exercise.setSelectedRootLecture = setSelectedRootLecture;
		exercise.setSelectedNextExercise = setSelectedNextExercise;
		exercise.updateSpeed = updateSpeed;


		$scope.codemirrorLoaded = function(_editor){
			exercise.editor = _editor;
		};

		function getExercise() {
			var args = {
					lessonID: exercise.lessonID,
			};
			if(exercise.id !== '')
			{
				args.exerciseID = exercise.id;
			}
			connection.sendMessage('getExercise', args);
		}
		
		var offDisplayMessage = listenersHandler.register('onmessage', connection.setupMessaging(handleMessage));
		getExercise();

		function handleMessage(data) {
			console.log('message received: ', data);
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
				case 'exercise': 
					setExercise(args.exercise);
					break;
				case 'executionResult': 
					displayResult(args.msgType, args.msg);
					break;
				case 'demoEnded':
					console.log('The demo ended!');
					exercise.isRunning = false;
					exercise.playedDemo = true;
					break;
				case 'operations':
					storeOperations(args.worldID, args.operations, 'current');
					if(exercise.updateViewLoop === null) {
						startUpdateViewLoop();
					}
					break;
				case 'demoOperations':
					storeOperations(args.worldID, args.operations, 'answer');
					if(exercise.updateViewLoop === null) {
						startUpdateViewLoop();
					}
					break;
				case 'log': 
					exercise.logs += args.msg;
					break;
				case 'exercises':
					storeExercisesList(args.exercises);
					break;
				case 'programmingLanguageSet':
					exercise.code = args.code;
					exercise.isChangingProgLang = false;
					break;
				default:
					console.log('Hum... Unknown message!');
					console.log(data);
					break;
			}
		}
 
		function setExercise(data) {
			exercise.id = data.id;
			exercise.instructions = $sce.trustAsHtml(data.instructions);
			exercise.api = $sce.trustAsHtml(data.api);
			exercise.code = data.code;
			exercise.currentWorldID = data.selectedWorldID;
			for(var worldID in data.initialWorlds) {
				exercise.initialWorlds[worldID] = {};
				var initialWorld = data.initialWorlds[worldID];
				var world;
				switch(initialWorld.type) {
					case 'BuggleWorld':
						world = new BuggleWorld(initialWorld);
						break;
				}
				exercise.initialWorlds[worldID] = world;
				exercise.answerWorlds[worldID] = world.clone();
				exercise.currentWorlds[worldID] = world.clone();
			}
			canvas.init();
			setCurrentWorld('current');
			exercise.worldIDs = Object.keys(exercise.currentWorlds);
			exercise.programmingLanguages = data.programmingLanguages;
			for(var i=0; i<exercise.programmingLanguages.length; i++) {
				var pl = exercise.programmingLanguages[i];
				if(pl.lang === data.currentProgrammingLanguage) {
					exercise.currentProgrammingLanguage = pl;
					setIDEMode(pl);
				}
			}
			$(document).foundation('dropdown', 'reflow');

			connection.sendMessage('getExercises', {});
		}
		
		function setCurrentWorld(worldKind) {
			exercise.worldKind = worldKind;
			exercise.currentWorld = exercise[exercise.worldKind+'Worlds'][exercise.currentWorldID];
			exercise.currentState = exercise.currentWorld.currentState;
			canvas.setWorld(exercise.currentWorld);
		}
		
		function runDemo() {
			exercise.isPlaying = true;
			setCurrentWorld('answer');
			if(!exercise.playedDemo) {
				var args = {
						lessonID: exercise.lessonID,
						exerciseID: exercise.id,
				};
				connection.sendMessage('runDemo', args);
				exercise.isRunning = true;
			}
			else {
				// We don't need to query the server again
				// Just to replay the animation
				replay();
			}
		}
		
		function runCode() {
			exercise.isPlaying = true;
			exercise.worldIDs.map(function(key) {
				reset(key, 'current', false);
			});
			var args = {
					lessonID: exercise.lessonID,
					exerciseID: exercise.id,
					code: exercise.code
			};
			connection.sendMessage('runExercise', args);
			exercise.isRunning = true;
		}
		
		function stopExecution() {
			connection.sendMessage('stopExecution', null);
		}
		
		function displayResult(msgType, msg) {
			console.log(msgType, ' - ', msg);
			exercise.result = msg;
			if(msgType === 1) {
				$('#successModal').foundation('reveal', 'open');
			}
			exercise.resultType = msgType;
			exercise.display = 'result';
			exercise.isRunning = false;
		}
		
		function reset(worldID, worldKind, keepOperations) {
			// We may want to keep the operations in order to replay the execution
			var operations = [];
			var steps = [];
			if(keepOperations === true) {
				operations = exercise[worldKind+'Worlds'][worldID].operations;
				steps = exercise[worldKind+'Worlds'][worldID].steps;
			}

			var initialWorld = exercise.initialWorlds[worldID];
			exercise[worldKind+'Worlds'][worldID] = initialWorld.clone();
			exercise[worldKind+'Worlds'][worldID].operations = operations;
			exercise[worldKind+'Worlds'][worldID].steps = steps;

			if(worldID === exercise.currentWorldID) {
				exercise.currentState = -1;
				exercise.currentWorld = exercise[worldKind+'Worlds'][worldID];
				canvas.setWorld(exercise.currentWorld);
			}
			
			clearTimeout(exercise.updateViewLoop);
			exercise.isPlaying = false;
		}
		
		function replay() {
			exercise.isPlaying = true;
			reset(exercise.currentWorldID, exercise.worldKind, true);
			startUpdateViewLoop();
		}
		
		
		function storeOperations(worldID, operations, worldKind) {
			var step = [];
			for(var i=0; i<operations.length; i++) {
				var operation = operations[i];
				var generatedOperation = exercise.currentWorld.generateOperation(operation);
				step.push(generatedOperation);
			}
			exercise[worldKind+'Worlds'][worldID].operations.push(step);
		}
		
		function startUpdateViewLoop() {
			exercise.updateViewLoop = setTimeout(updateView, exercise.timer);
		}
		
		function updateView() {
			var currentState = exercise.currentWorld.currentState;
			var nbStates = exercise.currentWorld.operations.length-1;
			if(currentState !== nbStates) {
				exercise.currentWorld.setState(++currentState);
				exercise.currentState = currentState;
				canvas.update();
			}
			if(!exercise.isRunning && currentState === nbStates){
				exercise.updateViewLoop = null;
				exercise.isPlaying = false;
			}
			else {
				exercise.updateViewLoop = setTimeout(updateView, exercise.timer);
			}
			$scope.$apply(); // Have to add this line to force AngularJS to update the view
		}
		
		function setWorldState(state) {
			state = parseInt(state);
			exercise.currentWorld.setState(state);
			exercise.currentState = state;
			canvas.update();
		}
		
		function storeExercisesList(exercises) {
			exercise.exercisesAsList = exercises;

			// Get the default next exercise
			for(var i=0; i<exercises.length; i++) {
				var exo = exercises[i];
				if(exo.id === exercise.id) {
					exercise.defaultNextExercise = exercises[i+1].id;
				}
			}

			// Refactor the exercises list as a tree
			var dataMap = exercises.reduce(function(map, node) {
				map[node.name] = node;
			 	return map;
			}, {});
			var treeData = [];
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
			exercise.exercisesAsTree = treeData;

			// Update modal
			$(document).foundation('reveal', 'reflow');
		}

		function setSelectedRootLecture(rootLecture) {
			exercise.selectedRootLecture = rootLecture;
		}

		function setSelectedNextExercise(exo) {
			exercise.selectedNextExercise = exo;
		}

		function setIDEMode(pl) {
			switch(pl.lang.toLowerCase()) {
				case 'java':
					exercise.editor.setOption('mode', 'text/x-java');
					break;
				case 'scala':
					exercise.editor.setOption('mode', 'text/x-scala');
					break;
				case 'c':
					exercise.editor.setOption('mode', 'text/x-csrc');
					break;
				case 'python':
					exercise.editor.setOption('mode', 'text/x-python');
					break;
			}
		}

		function setProgrammingLanguage(pl) {
			var args;
			exercise.isChangingProgLang = true;
			exercise.currentProgrammingLanguage = pl;
			setIDEMode(pl);
			args = {
					programmingLanguage: pl.lang,
			};
			connection.sendMessage('setProgrammingLanguage', args);

		}

		$scope.$on('$destroy',function() {
			offDisplayMessage();
		});

		function updateSpeed () {
			$scope.timer = $('#executionSpeed').val();
		};

		window.addEventListener('resize', canvas.resize, false);
	}
})();