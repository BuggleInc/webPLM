(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleWorld', BuggleWorld);
	
	BuggleWorld.$inject = [
		'BuggleWorldCell', 'Buggle', 
		'ChangeCellHasBaggle', 'ChangeCellColor', 
		'ChangeBuggleCarryBaggle', 'MoveBuggleOperation', 'ChangeBuggleDirection'
	];
	
	function BuggleWorld (BuggleWorldCell, Buggle,
			ChangeCellHasBaggle, ChangeCellColor,
			ChangeBuggleCarryBaggle, MoveBuggleOperation, ChangeBuggleDirection) {
		
		var BuggleWorld = function (type, width, height, cells, buggles) {
			this.type = type;
			this.width = width;
			this.height = height;
			this.operations = [];
			this.currentState = -1;
			
			this.cells = [];
			for(var i=0; i<width; i++) {
				this.cells[i] = [];
				for(var j=0; j<height; j++) {
					var cell = cells[i][j];
					this.cells[i][j] = new BuggleWorldCell(cell.x, cell.y, cell.color, cell.hasBaggle, cell.hasContent, cell.hasLeftWall, cell.hasTopWall);
				}
			}
			
			this.buggles = {};
			for(var buggleID in buggles) {
				var buggle = buggles[buggleID]
				this.buggles[buggleID] = new Buggle(buggle.x, buggle.y, buggle.color, buggle.direction, buggle.carryBaggle);
			}
		};
		
		BuggleWorld.prototype.clone = function () {
			return new BuggleWorld(this.type, this.width, this.height, this.cells, this.buggles)
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
			for(var buggleID in this.buggles) {
				this.buggles[buggleID].draw(ctx, canvasWidth, canvasHeight, this.width, this.height);
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
				return new MoveBuggleOperation(operation.buggleID, operation.newX, operation.newY, operation.oldX, operation.oldY);
			case 'changeBuggleDirection':
				return new ChangeBuggleDirection(operation.buggleID, operation.newDirection, operation.oldDirection);
			case 'changeBuggleCarryBaggle':
				return new ChangeBuggleDirection(operation.buggleID, operation.newCarryBaggle, operation.oldCarryBaggle);
			case 'changeCellColor': 
				return new ChangeCellColor(operation.cell.x, operation.cell.y, operation.newColor, operation.oldColor);
			case 'changeCellHasBaggle': 
				return new ChangeCellHasBaggle(operation.cell.x, operation.cell.y, operation.newHasBaggle, operation.oldHasBaggle);
			}
		}
		
		return BuggleWorld;
	}
})();