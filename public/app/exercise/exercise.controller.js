(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Exercise', Exercise);
	
	Exercise.$inject = [
		'$window', '$http', '$scope', '$sce', '$stateParams',
		'connection', 'listenersHandler', 'langs', 'exercisesList',
		'canvas', 'drawWithDOM',
		'$timeout', '$interval',
		'locker', 
		'BuggleWorld', 'BuggleWorldView',
		'BatWorld', 'BatWorldView'
	];

	function Exercise($window, $http, $scope, $sce, $stateParams,
		connection, listenersHandler, langs, exercisesList,
		canvas, drawWithDOM,
		$timeout, $interval,
		locker, 
		BuggleWorld, BuggleWorldView,
		BatWorld, BatWorldView) {

		var exercise = this;
		
		var panelID = 'panel';
		var canvasID = 'canvas';

		exercise.lessonID = $stateParams.lessonID;
		exercise.id = $stateParams.exerciseID;
		
		exercise.displayInstructions = 'instructions';
		exercise.displayResults = 'result';
		
		exercise.isRunning = false;
		exercise.isPlaying = false;
		exercise.isChangingProgLang = false;
		exercise.playedDemo = false;

		exercise.instructions = null;
		exercise.api = null;
		exercise.resultType = null;
		exercise.result = '';
		exercise.logs = '';
		
		exercise.nonImplementedWorldException = false;

		exercise.initialWorlds = {};
		exercise.answerWorlds = {};
		exercise.currentWorlds = {};
		exercise.currentWorld = null;
		exercise.currentWorldID = null;
		exercise.worldKind = 'current';
		exercise.worldIDs = []; // Mandatory to generate dynamically the select
		exercise.updateModelLoop = null;
		exercise.updateViewLoop = null;
		
		locker.bind($scope, 'timer', 1000);
		exercise.timer = locker.get('timer');

		exercise.currentState = -1;
		exercise.lastStateDrawn = -1;

		exercise.currentProgrammingLanguage = null;
		exercise.programmingLanguages = [];

		exercise.editor = null;

		exercise.exercisesAsList = null;
		exercise.exercisesAsTree = null;
		exercise.defaultNextExercise = null;
		exercise.selectedRootLecture = null;
		exercise.selectedNextExercise = null;

		exercise.drawServiceType = '';
		exercise.drawService = null;
		exercise.drawingArea = 'drawingArea';

		exercise.demoNeeded = false;
		exercise.objectiveViewNeeded = false;
		exercise.animationPlayerNeeded = false;

		exercise.instructionsIsFullScreen = false;
		exercise.instructionsClass='';
		exercise.worldsViewClass='';

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
		exercise.resetExercise = resetExercise;
		exercise.resizeInstructions = resizeInstructions;

		$scope.codemirrorLoaded = function(_editor){
			exercise.editor = _editor;
			resizeCodeMirror();
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

		function getTranslatedInstructions() {
			connection.sendMessage('getTranslatedInstructions', {});
		}
		
		$scope.$on('exercisesListReady', initExerciseSelector);
		$scope.$on('newLangSelected', getTranslatedInstructions);

		var offDisplayMessage = listenersHandler.register('onmessage', handleMessage);
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
					handleOperations(args.worldID, 'current', args.operations);
					break;
				case 'demoOperations':
					handleOperations(args.worldID, 'answer', args.operations);
					break;
				case 'log': 
					exercise.logs += args.msg;
					break;
				case 'newProgLang':
					updateUI(args.newProgLang, args.instructions, args.code);
					break;
				case 'translatedInstructions':
					updateInstructions(args.instructions, args.api);
					break;
			}
		}
 
		function setExercise(data) {
			exercise.id = data.id;
			exercise.instructions = $sce.trustAsHtml(data.instructions);
			exercise.api = $sce.trustAsHtml(data.api);
			exercise.code = data.code.trim();
			exercise.currentWorldID = data.selectedWorldID;

			if(data.exception === 'nonImplementedWorldException') {
				exercise.nonImplementedWorldException = true;
			}

			if(!exercise.nonImplementedWorldException) {
				for(var worldID in data.initialWorlds) {
					if(data.initialWorlds.hasOwnProperty(worldID)) {
						exercise.initialWorlds[worldID] = {};
						var initialWorld = data.initialWorlds[worldID];
						var world;
						switch(initialWorld.type) {
							case 'BuggleWorld':
								exercise.demoNeeded = true;
								exercise.objectiveViewNeeded = true;
								exercise.animationPlayerNeeded = true;
								world = new BuggleWorld(initialWorld);
								initCanvas(BuggleWorldView.draw);
								break;
							case 'BatWorld':
								world = new BatWorld(initialWorld);
								BatWorldView.setScope($scope);
								initDrawWithDOM(BatWorldView.draw);
								break;
						}
						exercise.initialWorlds[worldID] = world;
						exercise.answerWorlds[worldID] = world.clone();
						exercise.currentWorlds[worldID] = world.clone();
					}
				}

				exercise.worldIDs = Object.keys(exercise.currentWorlds);

				setCurrentWorld('current');

				window.addEventListener('resize', resizeCodeMirror, false);
			}

			exercise.programmingLanguages = data.programmingLanguages;
			for(var i=0; i<exercise.programmingLanguages.length; i++) {
				var pl = exercise.programmingLanguages[i];
				if(pl.lang === data.currentProgrammingLanguage) {
					exercise.currentProgrammingLanguage = pl;
					setIDEMode(pl);
				}
			}

			$(document).foundation('dropdown', 'reflow');
			$(document).foundation('equalizer', 'reflow');
			
			exercise.resultType = null;
			exercise.result = '';
			exercise.logs = '';

			exercisesList.setCurrentLessonID(exercise.lessonID);
		}

		function updateInstructions(instructions, api) {
			exercise.instructions = $sce.trustAsHtml(instructions);
			exercise.api = $sce.trustAsHtml(api);
		}
		
		function setCurrentWorld(worldKind) {
			$timeout.cancel(exercise.updateModelLoop);
			$interval.cancel(exercise.updateViewLoop);
			exercise.worldKind = worldKind;
			exercise.currentWorld = exercise[exercise.worldKind+'Worlds'][exercise.currentWorldID];
			exercise.currentState = exercise.currentWorld.currentState;
			exercise.drawService.setWorld(exercise.currentWorld);
		}
		
		function runDemo() {
			exercise.updateViewLoop = null;
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
			var args;

			exercise.updateViewLoop = null;
			exercise.isPlaying = true;
			exercise.worldIDs.map(function(key) {
				reset(key, 'current', false);
			});
			setCurrentWorld('current');
			args = {
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
				exercise.drawService.setWorld(exercise.currentWorld);
			}

			exercise.lastStateDrawn = -1;
			
			$timeout.cancel(exercise.updateViewLoop);
			exercise.isPlaying = false;
		}
		
		function replay() {
			reset(exercise.currentWorldID, exercise.worldKind, true);
			exercise.isPlaying = true;
			startUpdateModelLoop();
			startUpdateViewLoop();
		}
		
		function handleOperations(worldID, worldKind, operations) {
			var world = exercise[worldKind+'Worlds'][worldID];
			world.addOperations(operations);
			if(exercise.updateViewLoop === null) {
				exercise.isPlaying = true;
				startUpdateModelLoop();
				startUpdateViewLoop();
			}
		}

		function startUpdateModelLoop() {
			exercise.updateModelLoop = $timeout(updateModel, exercise.timer);
		}

		function updateModel() {
			var currentState = exercise.currentWorld.currentState;
			var nbStates = exercise.currentWorld.operations.length-1;
			if(currentState !== nbStates) {
				exercise.currentWorld.setState(++currentState);
				exercise.currentState = currentState;
			}
			
			if(!exercise.isRunning && currentState === nbStates){
				exercise.updateModelLoop = null;
				exercise.isPlaying = false;
			}
			else {
				exercise.updateModelLoop = $timeout(updateModel, exercise.timer);
			}
		}

		function startUpdateViewLoop() {
			exercise.updateViewLoop = $interval(updateView, 1/10);
		}
		
		function updateView() {
			if(exercise.lastStateDrawn !== exercise.currentWorld.currentState) {
				exercise.drawService.update();
				exercise.lastStateDrawn	= exercise.currentWorld.currentState;
			}

			if(!exercise.isPlaying){
				$interval.cancel(exercise.updateViewLoop);
			}
		}
		
		function setWorldState(state) {
			$timeout.cancel(exercise.updateModelLoop);
			$interval.cancel(exercise.updateViewLoop);
			exercise.isPlaying = false;
			state = parseInt(state);
			exercise.currentWorld.setState(state);
			exercise.currentState = state;
			exercise.drawService.update();
		}
		
		function initExerciseSelector() {
			exercisesList.setCurrentExerciseID(exercise.id);
			exercise.exercisesAsList = exercisesList.getExercisesList();
			exercise.exercisesAsTree = exercisesList.getExercisesTree();
			exercise.defaultNextExercise = exercisesList.getNextExerciseID();
			exercise.selectedRootLecture = null;
			exercise.selectedNextExercise = null;

			// Update modal
			$(document).foundation('reveal', 'reflow');
		}

		function setSelectedRootLecture(rootLecture) {
			exercise.selectedRootLecture = rootLecture;
			setSelectedNextExercise(rootLecture);
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
			exercise.isChangingProgLang = true;
			connection.sendMessage('setProgrammingLanguage', { programmingLanguage: pl.lang });
		}

		function updateUI(pl, instructions, code) {
			exercise.currentProgrammingLanguage = pl;
			setIDEMode(pl);
			exercise.instructions = $sce.trustAsHtml(instructions);
			exercise.code = code;
			exercise.isChangingProgLang = false;
		}

		function resetExercise() {
			$('#resetExerciseModal').foundation('reveal', 'close');
			connection.sendMessage('revertExercise', {});
		}

		function updateSpeed () {
			$scope.timer = $('#executionSpeed').val();
		}

		$scope.$on('$destroy',function() {
			offDisplayMessage();
			$timeout.cancel(exercise.updateModelLoop);
			$interval.cancel(exercise.updateViewLoop);
			exercise.initialWorlds = {};
			exercise.answerWorlds = {};
			exercise.currentWorlds = {};
			exercise.currentWorld = null;
			exercise.drawService.setWorld(null);
			exercise.instructions = null;
			exercise.api = null;
			exercise.resultType = null;
			exercise.result = null;
			exercise.logs = null;
		});

		function initCanvas(draw) {
			var canvasElt;
			var canvasWidth;
			var canvasHeight;

			exercise.drawServiceType = 'canvas';
			exercise.drawService = canvas;

			canvasElt = document.getElementById(canvasID);
			canvasWidth = $('#'+exercise.drawingArea).parent().width();
			canvasHeight = canvasWidth;

			canvas.init(canvasElt, canvasWidth, canvasHeight, draw);

			window.addEventListener('resize', resizeCanvas, false);
		}

		function initDrawWithDOM(draw) {
			var domElt;
			var panelWidth;

			exercise.drawServiceType = 'drawWithDOM';
			exercise.drawService = drawWithDOM;

			domElt = $('#'+panelID);
			panelWidth = $('#'+exercise.drawingArea).parent().width();
			domElt.css('height', panelWidth);
			domElt.css('overflow-y', 'auto');

			drawWithDOM.init(domElt, draw);
		}

		function resizeCanvas() {
			var canvasWidth = $('#'+exercise.drawingArea).parent().width();
			var canvasHeight = canvasWidth;
			exercise.drawService.resize(canvasWidth, canvasHeight);
			$(document).foundation('equalizer', 'reflow');
		}

		function resizeCodeMirror() {
			// Want to keep the IDE's height equals to the draw surface's one
			var drawingAreaHeight = $('#'+exercise.drawingArea).parent().width();
			exercise.editor.setSize(null, drawingAreaHeight);
			exercise.editor.refresh();
			$(document).foundation('equalizer', 'reflow');
		}

		function resizeInstructions() {
			if(!exercise.instructionsIsFullScreen) {
				exercise.instructionsIsFullScreen = true;
				exercise.instructionsClass='instructions-fullscreen';
				exercise.worldsViewClass='worlds-view-reduce';
			}
			else {
				exercise.instructionsIsFullScreen = false;
				exercise.instructionsClass='';
				exercise.worldsViewClass='';
			}
		}
	}
})();