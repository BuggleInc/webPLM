(function(){
    'use strict';
    
    angular
        .module('PLMApp')
        .controller('Editor', Editor);
    
    Editor.$inject = [
		'$window', '$http', '$scope', '$sce', '$stateParams',
		'connection', 'listenersHandler', 'langs', 'exercisesList',
		'canvas', 'color', 'ide', 'worlds',
		'$timeout', '$interval',
		'locker',
		'BuggleWorld', 'BuggleWorldView'
	];
    
    function Editor($window, $http, $scope, $sce, $stateParams,
		connection, listenersHandler, langs, exercisesList,
		canvas, color, ide, worlds,
		$timeout, $interval,
		locker,
		BuggleWorld, BuggleWorldView) {
        
        var panelID = 'panel';
        var canvasID = 'canvas';
        
        var editorExerciseLessonID = 'editor';
        var editorExerciseID = 'editor.lessons.editor.editor.Editor';
        var lessonToLoadID = $stateParams.lessonID;
        var exerciseToLoadID = $stateParams.exerciseID;
        
        var editor = this;
        
        editor.editorMode = 'world';
        
        editor.colorService = color;
        editor.drawService = null;
		editor.drawingArea = 'drawingArea';
        
        editor.errorMessage = null;
        
        editor.exerciseName = '';

        /*
            World editor
        */
        var topWallCmd = {name: 'Top wall', ID: 'topwall'};
        var leftWallCmd = {name: 'Left wall', ID: 'leftwall'};
        var buggleCmd = {name: 'Buggle', ID: 'buggle'};
        var deleteBuggleCmd = {name: 'Delete Buggle', ID: 'deletebuggle'};
        var addLineCmd = {name: 'Add line', ID: 'addline'};
        var removeLineCmd = {name: 'Remove line', ID: 'deleteline'};
        var addColumnCmd = {name: 'Add column', ID: 'addcolumn'};
        var removeColumnCmd = {name: 'Remove column', ID: 'deletecolumn'};
        
        editor.showConfirmDelete = false;
        
        editor.initialWorlds = [];
        editor.world = null;
        editor.currentWorldName = '';
        editor.nbWorldsAdded = 0;
        editor.selectedCell = null;
        editor.command = '';
        editor.commandType = '';
        editor.lastWallCommand = topWallCmd;
        editor.lastBuggleCommand = buggleCmd;
        editor.lastGridCommand = addLineCmd;
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
        
        
        editor.selectCell = selectCell;
        editor.initEditor = initEditor;
        editor.setCommand = setCommand;
        editor.setRGBColor = setRGBColor;
        editor.addLineAbove = addLineAbove;
        editor.addLineBelow = addLineBelow;
        editor.addColumnRight = addColumnRight;
        editor.addColumnLeft = addColumnLeft;
        editor.editorColor = editorColor;
        editor.deleteWorldCommand = deleteWorldCommand;
        editor.selectedBuggleColor = selectedBuggleColor;
        editor.selectedBuggleID = selectedBuggleID;
        editor.selectedCellColor = selectedCellColor;
        editor.selectedCellContent = selectedCellContent;
        editor.height = height;
        editor.width = width;
        
        editor.addWorld = addWorld;
        editor.deleteWorld = deleteWorld;
        editor.switchWorld = switchWorld;
        editor.deselectAll = deselectAll;
        editor.getWorldIndex = getWorldIndex;
        editor.worldName = worldName;
        
        /*
            Mission editor
        */
        editor.missionProgrammingLanguages = {all: true, c: false, java: false, scala: false, python: false};
        editor.missionText = '';
        editor.filteredMission = editor.missionText;
        
        
        editor.filterMission = filterMission;
        
        /*
            Solution editor
        */
        editor.ideService = ide;
        editor.worlds = worlds;
        editor.api = '';
        editor.solutionDisplayPanel = 'solution';
        locker.bind($scope, 'timer', 1000);
        editor.solutionCodes = {java: '', scala: '', c: '', python: ''};

        
        editor.initSolutionEditor = initSolutionEditor;
        editor.runSolution = runSolution;
        
        /*
            Save
        */
        editor.saveExercise = saveExercise;
        
        
        /*
            Editor
        */
        function getExercise(lessonID, exerciseID, mode) {
			var args = {
				lessonID: lessonID,
			};
			if(exerciseID !== '') {
				args.exerciseID = exerciseID;
			}
			connection.sendMessage(mode, args);
		}
        
        var offDisplayMessage = listenersHandler.register('onmessage', handleMessage);
        
        function handleMessage(data) {
			console.log('message received: ', data);
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
                case 'exercise':
                    setEditorExercise(args.exercise);
                    break;
                case 'exerciseToEdit':
                    initFromExercise(args.exercise);
                    break;
				case 'missionFiltered': 
					editor.filteredMission = args.filteredMission;
					break;
                case 'operations':
					worlds.handleOperations(args.worldID, 'current', args.operations);
					break;
                case 'executionResult':
                    worlds.isRunning(false);
                    break;
			}
		}

        function displayError(errorMessage) {
            editor.errorMessage = errorMessage;
            $('#errorModal').foundation('reveal', 'open');
        }
        
        $scope.codemirrorLoaded = function(_solutionEditor){
			ide.init(_solutionEditor);
		};
        
        
        /*
            World editor
        */
        function initEditor() {
            canvasID = 'canvas';
            editor.drawingArea = 'drawingArea';
            initCanvas(BuggleWorldView.draw);
            
            if(editor.world === null) {
                initWorlds();
            }
            else {
                editor.drawService.setWorld(editor.world);
            }
        }
        
        function initFromExercise(exercise) {
            var lastNewWorldName;
            for(var worldID in exercise.initialWorlds) {
                var buggleWorld = new BuggleWorld(exercise.initialWorlds[worldID]);
                buggleWorld.name = worldID;
                editor.initialWorlds.push(buggleWorld);
                lastNewWorldName = worldID;
            }
            switchWorld(lastNewWorldName);
            
            editor.missionText = exercise.missionHTML;
            editor.filterMission();
            
            
            var templateRegex = /^[\s\S]*((?:(?:\/\*)|#) BEGIN TEMPLATE(?: \*\/)?)([\s\S]+)((?:(?:\/\*)|#) BEGIN SOLUTION(?: \*\/)?)([\s\S]+)((?:(?:\/\*)|#) END SOLUTION(?: \*\/)?)([\s\S]+)((?:(?:\/\*)|#) END TEMPLATE(?: \*\/)?)[\s\S]*$/;
            
            var noTemplateRegex = /^[\s\S]*((?:(?:\/\*)|#) BEGIN SOLUTION(?: \*\/)?)([\s\S]+)((?:(?:\/\*)|#) END SOLUTION(?: \*\/)?)[\s\S]*$/;
            
            for(var solution in exercise.solutionCodes) {  
                var beginTemplate = '';
                var endTemplate = '';
                var beginSolution = '';
                var endSolution = '';
                var templateCode1 = '\n';
                var templateCode2 = '\n';
                var solutionCode = '';

                if(exercise.solutionCodes[solution].match(templateRegex)) {
                    beginTemplate = exercise.solutionCodes[solution].replace(templateRegex, '$1');
                    endTemplate = exercise.solutionCodes[solution].replace(templateRegex, '$7');
                    beginSolution = exercise.solutionCodes[solution].replace(templateRegex, '$3');
                    endSolution = exercise.solutionCodes[solution].replace(templateRegex, '$5');
                    templateCode1 = exercise.solutionCodes[solution].replace(templateRegex, '$2');
                    templateCode2 = exercise.solutionCodes[solution].replace(templateRegex, '$6');
                    solutionCode = exercise.solutionCodes[solution].replace(templateRegex, '$4');
                }
                else {
                    beginSolution = exercise.solutionCodes[solution].replace(noTemplateRegex, '$1');
                    endSolution = exercise.solutionCodes[solution].replace(noTemplateRegex, '$3');
                    solutionCode = exercise.solutionCodes[solution].replace(noTemplateRegex, '$2');
                }
                
                editor.solutionCodes[solution] = beginTemplate + templateCode1 + beginSolution + solutionCode 
                                                 + endSolution + templateCode2 + endTemplate;
            }
        }
        
        function initWorlds() {
            if(angular.isDefined(lessonToLoadID)) {
                getExercise(lessonToLoadID, exerciseToLoadID, 'getExerciseToEdit');
            }
            else {
                editor.addWorld('New world');
            }
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
        
        
        function addWorld(name) {
            var newWorld = new BuggleWorld();
            
            if(angular.isDefined(name)) {
                newWorld.name = name;
            }
            else {
                do {
                    editor.nbWorldsAdded++;
                    newWorld.name = 'New world ' + editor.nbWorldsAdded;
                } while(editor.getWorldIndex(newWorld.name) !== -1);
            }
            
            editor.initialWorlds.push(newWorld);
            editor.deselectAll();
            editor.world = newWorld;
            editor.currentWorldName = editor.world.name;
            editor.drawService.setWorld(newWorld);
        }
        
        function deleteWorld(name) {
            var nbWorlds = editor.initialWorlds.length;
            var index;
            
            if(nbWorlds !== 1) {
                index = editor.getWorldIndex(name);
            }
                
            if(index > -1) {
                editor.deselectAll();
                if(index === nbWorlds - 1) {
                    editor.world = editor.initialWorlds[index - 1];
                }
                else {
                    editor.world = editor.initialWorlds[index + 1];
                }
                editor.currentWorldName = editor.world.name;
                editor.drawService.setWorld(editor.world);
                editor.initialWorlds.splice(index, 1);
            }
        }
        
        function switchWorld(name) {
            for(var i = 0 ; i < editor.initialWorlds.length ; i++) {
                var world = editor.initialWorlds[i];
                if(world.name === name) {
                    editor.deselectAll();
                    editor.world = world;
                    editor.currentWorldName = editor.world.name;
                    editor.drawService.setWorld(world);
                }
            }
        }
        
        function deselectAll() {
            if(editor.world !== null) {
                editor.world.deselectCell();
                editor.selectedCell = null;
                editor._selectedBuggleID = null;
                editor.selectedBuggle = null;
            }
        }
        
        function getWorldIndex(name) {
            var index = -1;
            var i = 0;
            
            while(i < editor.initialWorlds.length && index === -1) {
                if(editor.initialWorlds[i].name === name) {
                    index = i;
                }
                i++;
            }
            
            return index;
        }
        
        function worldName(newName) {
            if(editor.world === null) {
               return null;
            }
            
            if(angular.isDefined(newName) && editor.getWorldIndex(newName) === -1) {
                editor.world.name = newName;
                editor.currentWorldName = newName;
            }
            return editor.world.name;
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
        
        function deleteWorldCommand() {
            if(editor.initialWorlds.length > 1) {
                $('#deleteWorldModal').foundation('reveal', 'open');
            }
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
            switch(command) {
                case 'topwall':
                    editor.lastWallCommand = topWallCmd;
                    editor.commandType = 'wall';
                    break;
                case 'leftwall':
                    editor.lastWallCommand = leftWallCmd;
                    editor.commandType = 'wall';
                    break;
                case 'buggle':
                    editor.lastBuggleCommand = buggleCmd;
                    editor.commandType = 'buggle';
                    break;
                case 'deletebuggle':
                    editor.lastBuggleCommand = deleteBuggleCmd;
                    editor.commandType = 'buggle';
                    break;
                case 'addline':
                    editor.lastGridCommand = addLineCmd;
                    editor.commandType = 'grid';
                    break;
                 case 'deleteline':
                    editor.lastGridCommand = removeLineCmd;
                    editor.commandType = 'grid';
                    break;
                case 'addcolumn':
                    editor.lastGridCommand = addColumnCmd;
                    editor.commandType = 'grid';
                    break;
                case 'deletecolumn':
                    editor.lastGridCommand = removeColumnCmd;
                    editor.commandType = 'grid';
                    break;
                default:
                    editor.commandType = '';
            }
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
            for(var lang in editor.missionProgrammingLanguages) {
				if(editor.missionProgrammingLanguages.hasOwnProperty(lang) && lang !== 'all') {
                    if(editor.missionProgrammingLanguages[lang]) {
                        listLang.push(lang);
                    }
                }
            }
            var args = {
                missionText: editor.missionText,
                all: editor.missionProgrammingLanguages.all,
                languages: listLang
			};
			connection.sendMessage('filterMission', args);
        }
        
        
        /*
            Solution editor
        */
        
        function initSolutionEditor() {
            getExercise(editorExerciseLessonID, editorExerciseID, 'getExercise');
            
            canvasID = 'solutionCanvas';
            editor.drawingArea = 'solutionDrawingArea';
            initCanvas(BuggleWorldView.draw);
            
            editor.world.deselectCell();
            
            worlds.init();
            worlds.setDrawService(editor.drawService);
            var initialWorlds = {};
            for(var i = 0 ; i < editor.initialWorlds.length ; i++) {
                var world = editor.initialWorlds[i];
                initialWorlds[world.name] = world;
            }
            worlds.setWorlds(editor.world.name, initialWorlds);
        }
        
        function runSolution() {
            worlds.setUpdateViewLoop(null);
			worlds.isPlaying(true);
            worlds.resetAll('current', false);
			worlds.setCurrentWorld('current');
            
            var args = {
                lessonID: editorExerciseLessonID,
                exerciseID: editorExerciseID,
                lang: ide.programmingLanguage().lang,
                code: editor.solutionCodes[ide.programmingLanguage().lang.toLowerCase()],
                world: worlds.currentWorld()
            };
            connection.sendMessage('editorRunSolution', args);
            worlds.isRunning(true);
        }

        function setEditorExercise(data) {
            editor.api = $sce.trustAsHtml(data.api);
            ide.programmingLanguages(data.programmingLanguages, data.currentProgrammingLanguage);
            $(document).foundation('dropdown', 'reflow');
        }
        
        
        /*
            Save
        */
        
        function saveExercise() {
            var lightInitialWorlds = [];
            
            for(var i = 0 ; i < editor.initialWorlds.length ; i++) {
                lightInitialWorlds[i] = editor.initialWorlds[i].toLightJSON()
            }
            
            var args = {
                name: editor.exerciseName,
                worlds: lightInitialWorlds,
                mission: editor.missionText
            };
            
            connection.sendMessage('editorSaveExercise', args);
        }
        
        $scope.$on('$destroy',function() {
			offDisplayMessage();
			worlds.init();
			editor.drawService.setWorld(null);
			editor.api = null;
		});
    }
})();