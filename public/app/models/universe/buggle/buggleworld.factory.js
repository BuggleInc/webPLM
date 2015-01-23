(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleWorld', BuggleWorld);
	
	BuggleWorld.$inject = [
		'BuggleWorldCell', 'Buggle', 
		'ChangeCellHasBaggle', 'ChangeCellColor', 
		'ChangeBuggleCarryBaggle', 'MoveBuggleOperation', 'ChangeBuggleDirection',
		'ChangeCellHasContent', 'ChangeCellContent', 'BuggleEncounterWall'
	];
	
	function BuggleWorld (BuggleWorldCell, Buggle,
			ChangeCellHasBaggle, ChangeCellColor,
			ChangeBuggleCarryBaggle, MoveBuggleOperation, ChangeBuggleDirection,
			ChangeCellHasContent, ChangeCellContent, BuggleEncounterWall) {
		
		var BuggleWorld = function (world) {
			this.type = world.type;
			this.width = world.width;
			this.height = world.height;
			this.operations = [];
			this.currentState = -1;
			this.steps = [];

			this.cells = [];
			for(var i=0; i<world.width; i++) {
				this.cells[i] = [];
				for(var j=0; j<world.height; j++) {
					var cell = world.cells[i][j];
					this.cells[i][j] = new BuggleWorldCell(cell);
				}
			}
			
			this.entities = {};
			for(var buggleID in world.entities) {
				var buggle = world.entities[buggleID]
				this.entities[buggleID] = new Buggle(buggle);
			}
		};
		
		BuggleWorld.prototype.clone = function () {
			return new BuggleWorld(this)
		};
		
		BuggleWorld.prototype.draw = function (ctx, canvasWidth, canvasHeight) {
			for(var i=0; i<this.width; i++) {
				for(var j=0; j<this.height; j++) {
					this.cells[i][j].draw(ctx, canvasWidth, canvasHeight, this.width, this.height);
				}
			}
			
			ctx.beginPath();
			
			ctx.lineWidth = 5;
			ctx.strokeStyle = 'SteelBlue';
			
			// frontier walls (since the world is a torus)
			for (var y = 0; y < this.height; y++) {
				if (this.cells[0][y].hasLeftWall) {
					var xLeft = canvasWidth;
					var yTop = canvasHeight/this.height*y;
					var yBottom = canvasHeight/this.height*(y+1);
					ctx.moveTo(xLeft, yTop);
					ctx.lineTo(xLeft, yBottom);		
				}
			}
			
			for (var x = 0; x < this.width; x++) {
				if (this.cells[x][0].hasTopWall) {
					var xLeft = canvasWidth/this.width*x;
					var xRight = canvasWidth/this.width*(x+1);
					var yTop = canvasHeight;
					ctx.moveTo(xLeft, yTop);
					ctx.lineTo(xRight, yTop);		
				}
			}
			
			ctx.stroke();
			ctx.closePath();
			for(var buggleID in this.entities) {
				this.entities[buggleID].draw(ctx, canvasWidth, canvasHeight, this.width, this.height);
			}
			
		};
		
		BuggleWorld.prototype.setState = function (state) {
			if(state < this.operations.length && state >= -1) {
				if(this.currentState < state) {
					for(var i=this.currentState+1; i<=state; i++) {
						var step = this.operations[i];
						for(var j=0; j<step.length; j++) {
							step[j].apply(this);
						}
					}
				}
				else {
					for(var i=this.currentState; i>state; i--) {
						var step = this.operations[i];
						for(var j=0; j<step.length; j++) {
							step[j].reverse(this);
						}
					}
				}
				this.currentState = state;
			}
		};
		
		BuggleWorld.prototype.generateOperation = function (operation) {
			switch(operation.type) {
			case 'moveBuggleOperation':
				return new MoveBuggleOperation(operation);
			case 'changeBuggleDirection':
				return new ChangeBuggleDirection(operation);
			case 'changeBuggleCarryBaggle':
				return new ChangeBuggleDirection(operation);
			case 'changeCellColor': 
				return new ChangeCellColor(operation);
			case 'changeCellHasBaggle': 
				return new ChangeCellHasBaggle(operation);
			case 'changeCellHasContent': 
				return new ChangeCellHasContent(operation);
			case 'changeCellContent': 
				return new ChangeCellContent(operation);
    		case 'buggleEncounterWall':
    			return new BuggleEncounterWall(operation);
			}
		}
		
		return BuggleWorld;
	}
})();