(function(){
    'use strict';
    
    angular
        .module('PLMApp')
        .controller('Editor', Editor);
    
    Editor.$inject = [
		'$window', '$http', '$scope', '$sce', '$stateParams',
		'connection', 'listenersHandler', 'langs', 'exercisesList',
		'canvas', 'color',
		'$timeout', '$interval',
		'locker',
		'BuggleWorld', 'BuggleWorldView'
	];
    
    function Editor($window, $http, $scope, $sce, $stateParams,
		connection, listenersHandler, langs, exercisesList,
		canvas, color,
		$timeout, $interval,
		locker,
		BuggleWorld, BuggleWorldView) {
        
        var panelID = 'panel';
        var canvasID = 'canvas';
        
        var editorExerciseLessonID = 'editor';
        var editorExerciseID = 'editor.lessons.editor.editor.Editor';
        
        var editor = this;
        
        editor.editorMode = 'world';
        
        editor.colorService = color;
        editor.drawService = null;
		editor.drawingArea = 'drawingArea';
        
        editor.errorMessage = null;
        
        /*
            World editor
        */
        editor.world = null;
        editor.selectedCell = null;
        editor.command = '';
        editor.customColorInput = '42/42/42';
        editor.color = [42, 42, 42, 255];
        editor.colors = color.getColorsNames();
        
        editor.directions = [{value: 0, name: 'North'},
                             {value: 1, name: 'East'},
                             {value: 2, name: 'South'},
                             {value: 3, name: 'West'}];
        
        editor._selectedBuggleID = null;
        editor.selectedBuggle = null;
        editor.nbBugglesCreated = 0;

        /*
            Mission editor
        */
        editor.missionProgrammingLanguages = {all: true, c: false, java: false, scala: false, python: false};
        editor.missionText = '';
        editor.filteredMission = editor.missionText;
        
        /*
            Solution editor
        */
        var worldID = 'New world';
        editor.api = '';
        editor.solutionDisplayPanel = 'solution';
        editor.initialWorlds = {};
		editor.answerWorlds = {};
		editor.currentWorlds = {};
        editor.currentWorld = null;
		editor.currentWorldID = null;
		editor.worldKind = 'current';
		editor.worldIDs = [];
        editor.updateModelLoop = null;
		editor.updateViewLoop = null;
        editor.isRunning = false;
		editor.isPlaying = false;
        editor.timer = locker.get('timer');
        editor.currentState = -1;
		editor.lastStateDrawn = -1;
		editor.preventLoop = false;
        
        editor.isChangingProgLang = false;
        
        editor.solutionInitalWorld = null;
        editor.solutionCurrentWorld = null;
        editor.programmingLanguages = [];
        editor.currentProgrammingLanguage = '';
        editor.solutionCodes = {java: '', scala: '', c: '', python: ''};
        editor.solutionEditor = null;
        
        editor.selectCell = selectCell;
        editor.initEditor = initEditor;
        editor.setCommand = setCommand;
        editor.setRGBColor = setRGBColor;
        editor.addLineAbove = addLineAbove;
        editor.addLineBelow = addLineBelow;
        editor.addColumnRight = addColumnRight;
        editor.addColumnLeft = addColumnLeft;
        editor.editorColor = editorColor;
        editor.selectedBuggleColor = selectedBuggleColor;
        editor.selectedBuggleID = selectedBuggleID;
        editor.selectedCellColor = selectedCellColor;
        editor.selectedCellContent = selectedCellContent;
        editor.height = height;
        editor.width = width;
        
        editor.filterMission = filterMission;
        
        editor.handleOperations = handleOperations;
        editor.startUpdateModelLoop = startUpdateModelLoop;
        editor.updateModel = updateModel;
        editor.startUpdateViewLoop = startUpdateViewLoop;
        editor.setWorldState = setWorldState;
        editor.updateView = updateView;
        editor.initSolutionEditor = initSolutionEditor;
        editor.runSolution = runSolution;
        editor.setProgrammingLanguage = setProgrammingLanguage;
        editor.replay = replay;
        editor.reset = reset;
        
        var offDisplayMessage = listenersHandler.register('onmessage', handleMessage);
        
        function handleMessage(data) {
			console.log('message received: ', data);
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
                case 'exercise':
                    setEditorExercise(args.exercise);
                    break;
				case 'missionFiltered': 
					editor.filteredMission = args.filteredMission;
					break;
                case 'newProgLang':
                    updateUI(args.newProgLang, args.instructions, null, args.code);
                    editor.isChangingProgLang = false;
                    break;
                case 'operations':
					handleOperations(args.worldID, 'current', args.operations);
					break;
                case 'executionResult':
                    editor.isRunning = false;
                    break;
			}
		}
        
        function displayError(errorMessage) {
            editor.errorMessage = errorMessage;
            $('#errorModal').foundation('reveal', 'open');
        }
        
        $scope.codemirrorLoaded = function(_solutionEditor){
			editor.solutionEditor = _solutionEditor;
		};
        
        
        /*
            World editor
        */
        
        function initEditor() {
            canvasID = 'canvas';
            editor.drawingArea = 'drawingArea';
            if(!editor.world) {
                editor.world = new BuggleWorld();
            }
            initCanvas(BuggleWorldView.draw);
            editor.drawService.setWorld(editor.world);
            editor.drawService.update();
        }
        
        function initCanvas(draw) {
			var canvasElt;
			var canvasWidth;
			var canvasHeight;

			editor.drawService = canvas;

			canvasElt = document.getElementById(canvasID);
			canvasWidth = $('#'+editor.drawingArea).parent().width();
			canvasHeight = canvasWidth;

			canvas.init(canvasElt, canvasWidth, canvasHeight, draw);

			window.addEventListener('resize', resizeCanvas, false);
		}
        
		function resizeCanvas() {
			var canvasWidth = $('#'+editor.drawingArea).parent().width();
			var canvasHeight = canvasWidth;
			editor.drawService.resize(canvasWidth, canvasHeight);
			$(document).foundation('equalizer', 'reflow');
		}
        
        function selectCell(event) {
            var offset = $('#' + canvasID).offset();
            var x = Math.floor((event.pageX - offset.left) / BuggleWorldView.getCellWidth());
            var y = Math.floor((event.pageY - offset.top) / BuggleWorldView.getCellHeight());

            editor.world.selectCell(x, y);
            editor.selectedCell = editor.world.selectedCell;
            
            switch(editor.command) {
                case 'topwall':
                    editor.selectedCell.hasTopWall = (editor.selectedCell.hasTopWall === true) ? false : true;
                    break;
                case 'leftwall':
                    editor.selectedCell.hasLeftWall = (editor.selectedCell.hasLeftWall === true) ? false : true;
                    break;
                case 'addbaggle':
                    editor.selectedCell.hasBaggle = (editor.selectedCell.hasBaggle === true) ? false : true;
                    break;
                case 'buggle':
                    buggleCommand(x, y);
                    break;
                case 'deletebuggle':
                    deleteBuggleCommand(x, y);
                    break;
                case 'color':
                    colorCommand();
                    break;
                case 'pickcolor':
                    pickColorCommand();
                    break;
                case 'text':
                    textCommand();
                    break;
                case 'addline':
                    addLineCommand();
                    break;
                case 'addcolumn':
                    addColumnCommand();
                    break;
                case 'deleteline':
                    deleteLineCommand(y);
                    break;
                case 'deletecolumn':
                    deleteColumnCommand(x);
                    break;
            }

            if(editor.command != 'buggle') {
                editor.selectedBuggle = null;
            }
            
            editor.drawService.update();
        }
        
        function buggleCommand(x, y) {
            var buggle;
            var bugglesID;
            var buggleID;
            var i = 0;
            var buggleFound = false;
            
            bugglesID = Object.keys(editor.world.entities);
            while(i < bugglesID.length && !buggleFound) {
                buggleID = bugglesID[i];
                buggle = editor.world.entities[buggleID];
                if(buggle.x == x && buggle.y == y) {
                    buggleFound = true;
                }
                i++;
            }
            if(!buggleFound) {
                do {
                    editor.nbBugglesCreated++;
                    buggleID = 'buggle' + editor.nbBugglesCreated;
                } while(editor.world.entities.hasOwnProperty(buggleID))
                
                buggle = {
                    x: x,
                    y: y,
                    color: [0, 0, 0, 255],
                    direction: 0,
                    carryBaggle: false,
                    brushDown: false
                };
                editor.world.entities[buggleID] = buggle;
            }
            
            editor._selectedBuggleID = buggleID;
            editor.selectedBuggle = buggle;
        }
        
        function deleteBuggleCommand(x, y) {
            var deleted = false;
            var bugglesID = Object.keys(editor.world.entities);
            var buggle;
            var buggleID;
            var i = 0;
            
            while(i < bugglesID.length && !deleted) {
                buggleID = bugglesID[i];
                buggle = editor.world.entities[buggleID];
                if(buggle.x == x && buggle.y == y) {
                    delete editor.world.entities[buggleID];
                }
                i++;
            }
        }
        
        function colorCommand() {
            var sameColor = true;
            var i = 0;
            while(i <  editor.selectedCell.color.length && sameColor) {
                if(editor.selectedCell.color[i] !== editor.color[i]) {
                    sameColor = false;
                }
                i++;
            }
            editor.selectedCell.color = (sameColor) ? [255,255,255,255] : editor.color;
        }
        
        function pickColorCommand() {
            editor.color = editor.selectedCell.color.slice();
            editor.setCommand('color');
        }
        
        function textCommand() {
            $scope.contentForm.cellContent.$rollbackViewValue();
            $('#setTextModal').foundation('reveal', 'open');
        }
        
        function addLineCommand() {
            $('#addLineModal').foundation('reveal', 'open');
        }
        
         function addColumnCommand() {
            $('#addColumnModal').foundation('reveal', 'open');
        }
        
        function deleteLineCommand(y) {
            if(editor.world.height > 1) {
                editor.world.addLine(y, -1);
            }
            else {
                displayError('You can\'t delete more lines');
            }
        }
        
        function deleteColumnCommand(x) {
            if(editor.world.width > 1) {
                editor.world.addColumn(x, -1);
            }
            else {
                displayError('You can\'t delete more columns');
            }
        }
        
        function setRGBColor() {
            var newColor = color.strToRGB(editor.customColorInput);
            if(newColor !== null) {
                editor.color = newColor;
                editor.color.push(255);
            }
            editor.customColorInput = color.RGBtoStr(editor.color);
        }
        
        function addLineAbove() {
            editor.world.addLine(editor.selectedCell.y);
            editor.drawService.update();
        }
        
        function addLineBelow() {
            editor.world.addLine(editor.selectedCell.y + 1);
            editor.drawService.update();
        }
        
        function addColumnLeft() {
            editor.world.addColumn(editor.selectedCell.x);
            editor.drawService.update();
        }
        
        function addColumnRight() {
            editor.world.addColumn(editor.selectedCell.x + 1);
            editor.drawService.update();
        }
        
        function setCommand(command) {
            editor.command = command;
        }
        
        function editorColor(newColor) {
            if(angular.isDefined(newColor)) {
                newColor = color.nameToRGB(newColor) || color.strToRGB(newColor);
                if(newColor) {
                    newColor.push(255);
                    editor.color = newColor;
                }
            }
            return editor.color;
        }
        
        function selectedBuggleColor(newColor) {
            if(editor.selectedBuggle === null) {
                return null;
            }
            if(angular.isDefined(newColor)) {
                newColor = color.strToRGB(newColor) || color.nameToRGB(newColor);
                if(newColor) {
                    newColor.push(255);
                    editor.selectedBuggle.color = newColor;
                    editor.drawService.update();
                }
            }
            return color.RGBtoName(editor.selectedBuggle.color) || color.RGBtoStr(editor.selectedBuggle.color);
        }
        
        function selectedBuggleID(newID) {
            if(editor.world === null) {
               return null;
            }
            if(angular.isDefined(newID)) {
                editor._selectedBuggleID = editor.world.changeBuggleID(editor._selectedBuggleID, newID);
            }
            return editor._selectedBuggleID;
        }
        
        function selectedCellColor(newColor) {
            if(editor.selectedCell === null) {
                return null;
            }
            if(angular.isDefined(newColor)) {
                newColor = color.strToRGB(newColor) || color.nameToRGB(newColor);
                if(newColor) {
                    newColor.push(255);
                    editor.selectedCell.color = newColor;
                    editor.drawService.update();
                }
            }
            return color.RGBtoName(editor.selectedCell.color) || color.RGBtoStr(editor.selectedCell.color);
        }
        
        function selectedCellContent(newContent) {
            if(editor.selectedCell === null) {
               return null;
            }
            if(angular.isDefined(newContent)) {
                editor.selectedCell.content = newContent;
                editor.selectedCell.hasContent = newContent !== '';
            }
            return editor.selectedCell.content;
        }
        
        function height(newHeight) {
            if(editor.world === null) {
               return null;
            }
            if(angular.isDefined(newHeight)) {
                newHeight = parseInt(newHeight);
                if(!isNaN(newHeight) && newHeight > 0) {
                    editor.world.setHeight(newHeight);
                    editor.drawService.update();
                }
            }
            return editor.world.height;
        }
        
        function width(newWidth) {
            if(editor.world === null) {
               return null;
            }
            if(angular.isDefined(newWidth)) {
                newWidth = parseInt(newWidth);
                if(!isNaN(newWidth) && newWidth > 0) {
                    editor.world.setWidth(newWidth);
                    editor.drawService.update();
                }
            }
            return editor.world.width;
        }
        
        
        /*
          Mission editor
        */
      
        function filterMission() {
            var listLang = [];
            for(var lang in editor.programmingLanguages) {
				if(editor.programmingLanguages.hasOwnProperty(lang) && lang !== 'all') {
                    if(editor.programmingLanguages[lang]) {
                        listLang.push(lang);
                    }
                }
            }
            var args = {
                missionText: editor.missionText,
                all: editor.programmingLanguages.all,
                languages: listLang
			};
			connection.sendMessage('filterMission', args);
        }
        
        
        /*
            Solution editor
        */
        
        function initSolutionEditor() {
            getEditorExercise();
            
            canvasID = 'solutionCanvas';
            editor.drawingArea = 'solutionDrawingArea';
            initCanvas(BuggleWorldView.draw);
            
            editor.world.deselectCell();
            
            editor.currentWorldID = worldID;
            editor.initialWorlds[worldID] = editor.world;
            editor.currentWorlds[worldID] = editor.world.clone();
            editor.worldIDs = Object.keys(editor.currentWorlds);
            setCurrentWorld('current');
            editor.drawService.update();
        }
        
        function runSolution() {
            editor.updateViewLoop = null;
			editor.isPlaying = true;
			editor.worldIDs.map(function(key) {
				reset(key, 'current', false);
			});
			setCurrentWorld('current');
            
            var args = {
                lessonID: editorExerciseLessonID,
                exerciseID: editorExerciseID,
                lang: editor.currentProgrammingLanguage.lang,
                code: editor.solutionCodes[editor.currentProgrammingLanguage.lang],
                world: editor.currentWorld
            };
            connection.sendMessage('editorRunSolution', args);
            editor.isRunning = true;
        }
        
        function getEditorExercise() {
            var args = {
                lessonID: editorExerciseLessonID,
                exerciseID: editorExerciseID
			};
            connection.sendMessage('getExercise', args);
        }
        
        function setEditorExercise(data) {
            editor.api = $sce.trustAsHtml(data.api);
            editor.programmingLanguages = data.programmingLanguages;
            for(var i = 0; i < editor.programmingLanguages.length; i++) {
                var pl = editor.programmingLanguages[i];
                if(pl.lang === data.currentProgrammingLanguage) {
                   editor.currentProgrammingLanguage = pl;
                   setIDEMode(pl);
                }
            }
            $(document).foundation('dropdown', 'reflow');
        }
        
        function handleOperations(worldID, worldKind, operations) {
			var world = editor[worldKind+'Worlds'][worldID];
			world.addOperations(operations);
			if(editor.updateViewLoop === null) {
				editor.isPlaying = true;
				startUpdateModelLoop();
				startUpdateViewLoop();
			}
		}
        
        function startUpdateModelLoop() {
			editor.updateModelLoop = $timeout(updateModel, editor.timer);
		}
        
        function updateModel() {
			var currentState = editor.currentWorld.currentState;
			var nbStates = editor.currentWorld.operations.length-1;
			if(currentState !== nbStates) {
				editor.currentWorld.setState(++currentState);
				editor.currentState = currentState;
			}
			
			if(!editor.isRunning && currentState === nbStates){
				editor.updateModelLoop = null;
				editor.isPlaying = false;
			}
			else {
				editor.updateModelLoop = $timeout(updateModel, editor.timer);
			}
		}
        
        function startUpdateViewLoop() {
			editor.updateViewLoop = $interval(updateView, 1/10);
		}
        
        function setWorldState(state) {
			$timeout.cancel(editor.updateModelLoop);
			$interval.cancel(editor.updateViewLoop);
			editor.isPlaying = false;
			state = parseInt(state);
			editor.currentWorld.setState(state);
			editor.currentState = state;
			editor.drawService.update();
		}
        
        function updateView() {
			if(editor.lastStateDrawn !== editor.currentWorld.currentState) {
				editor.drawService.update();
				editor.lastStateDrawn = editor.currentWorld.currentState;
			}

			if(!editor.isPlaying){
				$interval.cancel(editor.updateViewLoop);
			}
		}

        function setCurrentWorld(worldKind) {
			$timeout.cancel(editor.updateModelLoop);
			$interval.cancel(editor.updateViewLoop);
			editor.worldKind = worldKind;
			editor.currentWorld = editor[editor.worldKind+'Worlds'][editor.currentWorldID];
			editor.currentState = editor.currentWorld.currentState;
			editor.drawService.setWorld(editor.currentWorld);
		}
        
        function setIDEMode(pl) {
			switch(pl.lang.toLowerCase()) {
				case 'java':
					editor.solutionEditor.setOption('mode', 'text/x-java');
					break;
				case 'scala':
					editor.solutionEditor.setOption('mode', 'text/x-scala');
					break;
				case 'c':
					editor.solutionEditor.setOption('mode', 'text/x-csrc');
					break;
				case 'python':
					editor.solutionEditor.setOption('mode', 'text/x-python');
					break;
			}
		}
        
        function setProgrammingLanguage(pl) {
			editor.isChangingProgLang = true;
			connection.sendMessage('setProgrammingLanguage', { programmingLanguage: pl.lang });
		}
        
        function updateUI(pl, instructions, api, code) {
			editor.currentProgrammingLanguage = pl;
			setIDEMode(pl);
			editor.instructions = $sce.trustAsHtml(instructions);
			if(api !== null)
                editor.api = $sce.trustAsHtml(api);
		}
        
        function replay() {
			reset(editor.currentWorldID, editor.worldKind, true);
			editor.isPlaying = true;
			startUpdateModelLoop();
			startUpdateViewLoop();
		}
        
        function reset(worldID, worldKind, keepOperations) {
			// We may want to keep the operations in order to replay the execution
			var operations = [];
			var steps = [];
			if(keepOperations === true) {
				operations = editor[worldKind+'Worlds'][worldID].operations;
				steps = editor[worldKind+'Worlds'][worldID].steps;
			}

			var initialWorld = editor.initialWorlds[worldID];
			editor[worldKind+'Worlds'][worldID] = initialWorld.clone();
			editor[worldKind+'Worlds'][worldID].operations = operations;
			editor[worldKind+'Worlds'][worldID].steps = steps;

			if(worldID === editor.currentWorldID) {
				editor.currentState = -1;
				editor.currentWorld = editor[worldKind+'Worlds'][worldID];
				editor.drawService.setWorld(editor.currentWorld);
			}

			editor.lastStateDrawn = -1;
			
			$timeout.cancel(editor.updateViewLoop);
			editor.isPlaying = false;
		}
    }
})();