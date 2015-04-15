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
        
        editor.world = null;
        editor.selectedCell = null;
        editor.command = 'topwall';
        
        editor.customColorInput = '42/42/42';
        editor.color = [42, 42, 42, 255];
        editor.colors = color.getColorsNames();
        editor.colorNameSelect = null;
        
        editor.setTextInput = null;
        
        editor.selectedBuggleID = null;
        editor.selectedBuggle = null;
        editor.nbBugglesCreated = 0;
        
		editor.drawService = null;
		editor.drawingArea = 'drawingArea';
        
        editor.selectCell = selectCell;
        editor.initEditor = initEditor;
        editor.setCommand = setCommand;
        editor.setRGBColor = setRGBColor;
        editor.setColorByName = setColorByName;
        editor.setText = setText;
        
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
                    editor.setTextInput = editor.selectedCell.content;
                    $('#setTextModal').foundation('reveal', 'open');
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
                editor.nbBugglesCreated++;
                buggleID = 'buggle' + (editor.nbBugglesCreated);
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
            
            editor.selectedBuggleID = buggleID;
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
        
        function setColorByName() {
            var newColor = color.nameToRGB(editor.colorNameSelect);
            if(newColor !== null) {
                editor.color = newColor;
                editor.color.push(255);
            }
        }
        
        function setRGBColor() {
            var expr = /(\d+)\/(\d+)\/(\d+)/;
            editor.color = [];
            editor.color.push(parseInt(editor.customColorInput.replace(expr, '$1')));
            editor.color.push(parseInt(editor.customColorInput.replace(expr, '$2')));
            editor.color.push(parseInt(editor.customColorInput.replace(expr, '$3')));
            editor.color.forEach(function(num, pos, tab) {
                if(num > 255)  tab[pos] = 255;
                else if(num < 0) tab[pos] = 0;
            });
            editor.color.push(255);
        }
        
        function setText() {
            editor.selectedCell.hasContent = (editor.setTextInput.length !== '') ? true : false;
            editor.selectedCell.content = editor.setTextInput;
            editor.drawService.update();
        }
        
        function setCommand(command) {
            editor.command = command;
        }
    }
})();