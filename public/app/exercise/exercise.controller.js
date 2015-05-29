(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Exercise', Exercise);
	
	Exercise.$inject = [
		'$window', '$http', '$scope', '$sce', '$stateParams',
		'connection', 'listenersHandler', 'langs', 'exercisesList',
		'canvas', 'drawWithDOM', 'ide', 'worlds',
		'$timeout', '$interval',
		'locker', 
		'BuggleWorld', 'BuggleWorldView',
		'BatWorld', 'BatWorldView',
		'SortingWorld', 'SortingWorldView',
		'SortingWorldSecondView',
		'DutchFlagWorld', 'DutchFlagView',
		'PancakeWorld', 'PancakeView'
	];

	function Exercise($window, $http, $scope, $sce, $stateParams,
		connection, listenersHandler, langs, exercisesList,
		canvas, drawWithDOM, ide, worlds,
		$timeout, $interval,
		locker, 
		BuggleWorld, BuggleWorldView,
		BatWorld, BatWorldView, 
		SortingWorld, SortingWorldView, SortingWorldSecondView, 
		DutchFlagWorld, DutchFlagView,
		PancakeWorld, PancakeView ) {

		var exercise = this;
		
		var panelID = 'panel';
		var canvasID = 'canvas';

		exercise.tabs = [];
		exercise.currentTab = 0;
		exercise.drawFnct = null;
		
		exercise.worlds = worlds;

		exercise.lessonID = $stateParams.lessonID;
		exercise.id = $stateParams.exerciseID;
		
		exercise.displayInstructions = 'instructions';
		exercise.displayResults = 'result';
		
		exercise.playedDemo = false;

		exercise.instructions = null;
		exercise.api = null;
		exercise.resultType = null;
		exercise.result = '';
		exercise.logs = '';
		
		exercise.nonImplementedWorldException = false;
		
		locker.bind($scope, 'timer', 1000);

        exercise.ideService = ide;

		exercise.exercisesAsList = null;
		exercise.exercisesAsTree = null;
		exercise.defaultNextExercise = null;
		exercise.selectedRootLecture = null;
		exercise.selectedNextExercise = null;

		exercise.drawServiceType = '';
		exercise.drawService = null;
		exercise.drawingArea = 'drawingArea';

		exercise.objectiveViewNeeded = false;
		exercise.animationPlayerNeeded = false;
		exercise.secondViewNeeded = false;
		exercise.displaySecondView = false;

		exercise.instructionsIsFullScreen = false;
		exercise.instructionsClass='';
		exercise.worldsViewClass='';

		exercise.runDemo = runDemo;
		exercise.runCode = runCode;
		exercise.stopExecution = stopExecution;
		exercise.switchToTab = switchToTab;

		exercise.setSelectedRootLecture = setSelectedRootLecture;
		exercise.setSelectedNextExercise = setSelectedNextExercise;
		exercise.updateSpeed = updateSpeed;
		exercise.resetExercise = resetExercise;
		exercise.resizeInstructions = resizeInstructions;

		$scope.codemirrorLoaded = function(_editor){
			ide.init(_editor);
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
		
		$scope.$on('exercisesListReady', initExerciseSelector);

		var offDisplayMessage = listenersHandler.register('onmessage', handleMessage);
        
        function waitCanvas() {
            var c = document.getElementById(canvasID);
            if(c === null) {
                $timeout(waitCanvas, 0);
            }
            else {
                getExercise();
            }
        }
        waitCanvas();

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
					worlds.isRunning(false);
					break;
				case 'operations':
					worlds.handleOperations(args.worldID, 'current', args.operations);
					break;
				case 'demoOperations':
					worlds.handleOperations(args.worldID, 'answer', args.operations);
					break;
				case 'log': 
					exercise.logs += args.msg;
					break;
				case 'newProgLang':
					updateUI(args.instructions, null);
					break;
				case 'newHumanLang':
					updateUI(exercise.currentProgrammingLanguage, args.instructions, args.api, null);
					break;
			}
		}
 
		function setExercise(data) {
			exercise.id = data.id;
			exercise.instructions = $sce.trustAsHtml(data.instructions);
			exercise.api = $sce.trustAsHtml(data.api);
			ide.code(data.code.trim());
			
            worlds.init();
 
			if(data.exception === 'nonImplementedWorldException') {
				exercise.nonImplementedWorldException = true;
			}

			if(!exercise.nonImplementedWorldException) {
				for(var worldID in data.initialWorlds) {
					if(data.initialWorlds.hasOwnProperty(worldID)) {
						var initialWorld = data.initialWorlds[worldID];
						var world;
						switch(initialWorld.type) {
							case 'BuggleWorld':
								exercise.tabs = [
								{
									name : 'World',
									worldKind : 'current',
									tabNumber : 0,
									drawFnct : BuggleWorldView.draw
								 },
								 {
								 	name : 'Objective',
								 	worldKind : 'answer',
								 	tabNumber : 1,
								 	drawFnct : BuggleWorldView.draw
								 }
								];
								exercise.objectiveViewNeeded = true;
								exercise.animationPlayerNeeded = true;
								initCanvas(BuggleWorldView.draw);
								exercise.drawFnct = BuggleWorldView.draw;
								break;
							case 'BatWorld':
								exercise.tabs = [
								{
									name : 'World',
									worldKind : 'current',
									tabNumber : 0,
									drawFnct : BatWorldView.draw
								 }
								];
								exercise.drawFnct = BatWorldView.draw;
								BatWorldView.setScope($scope);
								initDrawWithDOM(BatWorldView.draw);
								break;
							case 'SortingWorld':
								exercise.tabs = [
								{
									name : 'World',
									worldKind : 'current',
									tabNumber : 0,
									drawFnct : SortingWorldView.draw
								 },
								 {
								 	name : 'Objective',
								 	worldKind : 'answer',
								 	tabNumber : 1,
								 	drawFnct : SortingWorldView.draw
								 },
								 {
								 	name: 'ChronoView',
								 	worldKind : 'current',
								 	tabNumber : 2,
								 	drawFnct : SortingWorldSecondView.draw
								 },
								 {
								 	name : 'ChronoDemo',
								 	worldKind : 'answer',
								 	tabNumber : 3,
								 	drawFnct : SortingWorldSecondView.draw
								 }
								];
								exercise.drawFnct = SortingWorldView.draw;
								exercise.objectiveViewNeeded = true;
								exercise.animationPlayerNeeded = true;
								exercise.secondViewNeeded = true;
								initCanvas(SortingWorldView.draw);
								break;
							case 'DutchFlagWorld':
								exercise.tabs = [
								{
									name : 'World',
									worldKind : 'current',
									tabNumber : 0,
									drawFnct : DutchFlagView.draw
								 },
								 {
								 	name : 'Objective',
								 	worldKind : 'answer',
								 	tabNumber : 1,
								 	drawFnct : DutchFlagView.draw
								 }
								]; 
								exercise.drawFnct = DutchFlagView.draw;
								exercise.objectiveViewNeeded = true;
								exercise.animationPlayerNeeded = true;
								initCanvas(DutchFlagView.draw);
								break;
							case 'PancakeWorld' :
								exercise.tabs = [
								{
									name : 'World',
									worldKind : 'current',
									tabNumber : 0,
									drawFnct : PancakeView.draw
								 },
								 {
								 	name : 'Objective',
								 	worldKind : 'answer',
								 	tabNumber : 1,
								 	drawFnct : PancakeView.draw
								 }
								]; 
								exercise.drawFnct = PancakeView.draw;
								exercise.objectiveViewNeeded = true;
								exercise.animationPlayerNeeded = true;
								initCanvas(PancakeView.draw);
								break; 

						}
					}
				}

                worlds.setWorlds(data.selectedWorldID, data.initialWorlds);
                
				window.addEventListener('resize', resizeCodeMirror, false);
			}
            
            ide.programmingLanguages(data.programmingLanguages, data.currentProgrammingLanguage);

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

		function runDemo() {
			worlds.setUpdateViewLoop(null);
			worlds.isPlaying(true);
			if(!exercise.playedDemo) {
				var args = {
						lessonID: exercise.lessonID,
						exerciseID: exercise.id,
				};
				connection.sendMessage('runDemo', args);
				exercise.playedDemo = true;
				worlds.isRunning(true);
			}
			else {
				// We don't need to query the server again
				// Just to replay the animation
				worlds.replay();
			}
		}
		
		function runCode() {
			var args;

			worlds.setUpdateViewLoop(null);
			worlds.isPlaying(true);
			worlds.resetAll('current', false);
			worlds.setCurrentWorld('current');
			exercise.tabs.map(function(element)
			{
				if(element.worldKind === 'current' && element.drawFnct === exercise.drawFnct)
				{
					exercise.currentTab = element.tabNumber;
				}
			})
			args = {
					lessonID: exercise.lessonID,
					exerciseID: exercise.id,
					code: ide.code()
			};
			connection.sendMessage('runExercise', args);
			worlds.isRunning(true);
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
			worlds.isRunning(false);
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

		function updateUI(instructions, api) {
			exercise.instructions = $sce.trustAsHtml(instructions);
			if(api !== null) {
				exercise.api = $sce.trustAsHtml(api);
			}
		}

		function resetExercise() {
			$('#resetExerciseModal').foundation('reveal', 'close');
			connection.sendMessage('revertExercise', {});
		}

		function updateSpeed () {
			$scope.timer = $('#executionSpeed').val();
            worlds.timer($scope.timer);
		}

		$scope.$on('$destroy',function() {
			offDisplayMessage();
            exercise.drawService.setWorld(null);
			worlds.init();
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
            worlds.setDrawService(canvas, 'canvas');
            
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
			worlds.setDrawService(drawWithDOM, 'drawWithDOM');

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
			ide.codeEditor().setSize(null, drawingAreaHeight);
			ide.codeEditor().refresh();
			$(document).foundation('equalizer', 'reflow');
		}

		function switchToTab(tab) {
			exercise.currentTab = tab.tabNumber;
			if(exercise.drawFnct !== tab.drawFnct) {
				setDrawFnct(tab.drawFnct);
			}
			if(worlds.worldKind() !== tab.worldKind) {
				worlds.setCurrentWorld(tab.worldKind);
				if(!exercise.playedDemo && tab.worldKind === 'answer') {
					runDemo();
				}
			}
		}

		function setDrawFnct(drawFnct) {
			exercise.drawService.setDraw(drawFnct);
			exercise.drawFnct = drawFnct;
			exercise.drawService.update();
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