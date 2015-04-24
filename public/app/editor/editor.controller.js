(function(){
    'use strict';
    
    angular
        .module('PLMApp')
        .controller('Editor', Editor);
    
    Editor.$inject = [
		'$window', '$http', '$scope', '$sce', '$stateParams',
		'connection', 'listenersHandler', 'langs', 'exercisesList',
		'canvas', 'color',
		'$timeout',
		'locker',
		'BuggleWorld', 'BuggleWorldView'
	];
    
    function Editor($window, $http, $scope, $sce, $stateParams,
		connection, listenersHandler, langs, exercisesList,
		canvas, color,
		$timeout,
		locker,
		BuggleWorld, BuggleWorldView) {
        
        var panelID = 'panel';
        var canvasID = 'canvas';
        
        var editor = this;
        
        editor.editorMode = 'world';

        editor.world = null;
        editor.selectedCell = null;
        editor.command = null;
        
        editor.customColorInput = '42/42/42';
        editor.color = [42, 42, 42, 255];
        editor.colors = color.getColorsNames();
        editor.colorNameSelect = null;
        
        editor.directions = [{value: 0, name: 'North'},
                             {value: 1, name: 'East'},
                             {value: 2, name: 'South'},
                             {value: 3, name: 'West'}];
        
        editor._selectedBuggleID = null;
        editor.selectedBuggle = null;
        editor.nbBugglesCreated = 0;
        
		editor.drawService = null;
		editor.drawingArea = 'drawingArea';
        
        editor.programmingLanguages = {all: true, c: false, java: true, scala: false, python: false};
        console.log(editor.programmingLanguages);
        editor.missionText = '';
        editor.filteredMission = editor.missionText;
        
        editor.errorMessage = null;
        
        editor.selectCell = selectCell;
        editor.initEditor = initEditor;
        editor.setCommand = setCommand;
        editor.setRGBColor = setRGBColor;
        editor.setColorByName = setColorByName;
        editor.addLineAbove = addLineAbove;
        editor.addLineBelow = addLineBelow;
        editor.addColumnRight = addColumnRight;
        editor.addColumnLeft = addColumnLeft;
        editor.selectedBuggleColor = selectedBuggleColor;
        editor.selectedBuggleID = selectedBuggleID;
        editor.selectedCellColor = selectedCellColor;
        editor.selectedCellContent = selectedCellContent;
        editor.height = height;
        editor.width = width;
        
        editor.filterMission = filterMission;
        
        var offDisplayMessage = listenersHandler.register('onmessage', handleMessage);
        
        function handleMessage(data) {
			console.log('message received: ', data);
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
				case 'missionFiltered': 
					editor.filteredMission = args.filteredMission;
					break;
			}
		}
        
        function displayError(errorMessage) {
            editor.errorMessage = errorMessage;
            $('#errorModal').foundation('reveal', 'open');
        }
        
        function initEditor() {
            editor.world = new BuggleWorld();
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
                    if(editor.world.height > 1) {
                        deleteLineCommand(y);
                    }
                    else {
                        displayError('You can\'t delete more lines');
                    }
                    break;
                case 'deletecolumn':
                    if(editor.world.width > 1) {
                        deleteColumnCommand(x);
                    }
                    else {
                        displayError('You can\'t delete more columns');
                    }
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
            editor.world.addLine(y, -1);
        }
        
        function deleteColumnCommand(x) {
            editor.world.addColumn(x, -1);
        }
        
        function setColorByName() {
            var newColor = color.nameToRGB(editor.colorNameSelect);
            if(newColor !== null) {
                editor.color = newColor;
                editor.color.push(255);
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
    }
})();