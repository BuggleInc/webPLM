(function(){
    'use strict';
    
    angular
        .module('PLMApp')
        .controller('Editor', Editor);
    
    Editor.$inject = [
		'$window', '$http', '$scope', '$sce', '$stateParams',
		'connection', 'listenersHandler', 'langs', 'exercisesList',
		'canvas',
		'$timeout',
		'locker',
		'BuggleWorld', 'BuggleWorldView'
	];
    
    function Editor($window, $http, $scope, $sce, $stateParams,
		connection, listenersHandler, langs, exercisesList,
		canvas,
		$timeout,
		locker,
		BuggleWorld, BuggleWorldView) {
        
        var panelID = 'panel';
        var canvasID = 'canvas';
        
        var editor = this;
        
        editor.world = null;
        editor.selectedCell = null;
        editor.command = 'topwall';
        editor.selectedBuggleID = null;
        editor.selectedBuggle = null;
        editor.nbBugglesCreated = 0;
		editor.drawService = null;
		editor.drawingArea = 'drawingArea';
        
        editor.selectCell = selectCell;
        editor.initEditor = initEditor;
        editor.setCommand = setCommand;
        
        
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
        
        function setCommand(command) {
            editor.command = command;
        }
    }
})();