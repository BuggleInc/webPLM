(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Exercise', Exercise);
	
	Exercise.$inject = ['$http', '$scope', '$sce', '$stateParams', 'connection', 'listenersHandler', 'canvas', 'DefaultColors', 'OutcomeKind', 'BuggleWorld'];
	
	function Exercise($http, $scope, $sce, $stateParams, connection, listenersHandler, canvas, DefaultColors, OutcomeKind, BuggleWorld) {
		var exercise = this;
				
		exercise.lessonID = $stateParams.lessonID;
		exercise.id = $stateParams.exerciseID;
		exercise.display = 'instructions';
		exercise.isRunning = false;
		exercise.isPlaying = false;
		exercise.playedDemo = false;
		exercise.instructions = null;
		exercise.api = null;
		exercise.resultType = null;
		exercise.resultMsg = null;
		exercise.initialWorlds = {};
		exercise.answerWorlds = {};
		exercise.currentWorlds = {};
		exercise.currentWorld = null;
		exercise.currentWorldID = null;
		exercise.worldKind = 'current';
		exercise.worldIDs = []; // Mandatory to generate dynamically the select
		exercise.updateViewLoop = null;
		exercise.timer = 1000;
		exercise.currentState = -1;
		
		exercise.runDemo = runDemo;
		exercise.runCode = runCode;
		exercise.reset = reset;
		exercise.replay = replay;
		exercise.stopExecution = stopExecution;
		exercise.setWorldState = setWorldState;
		exercise.setCurrentWorld = setCurrentWorld;
		
		function getExercise() {
			var args = {
					lessonID: exercise.lessonID,
			};
			if(exercise.id !== "")
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
	    			console.log('log: ', args.msg);
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
			//reset(false);
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
			exercise.resultType = msgType;
			exercise.isRunning = false;
		}
		
		function reset(worldID, worldKind, keepOperations) {
			// We may want to keep the operations in order to replay the execution
			var operations = keepOperations === true ? exercise[worldKind+'Worlds'][worldID].operations : [];
			var initialWorld = exercise.initialWorlds[worldID];
			exercise[worldKind+'Worlds'][worldID] = initialWorld.clone();
			exercise.currentWorld = exercise[worldKind+'Worlds'][worldID];
			exercise.currentWorld.operations = operations;
			exercise.currentState = -1;
			canvas.setWorld(exercise.currentWorld);
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
			this.currentWorld.setState(state);
			this.currentState = state;
			canvas.update();
		}
		
		$scope.$on("$destroy",function() {
	    	offDisplayMessage();
    	});

    	window.addEventListener('resize', canvas.resize, false);
	}
})();