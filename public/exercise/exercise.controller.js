(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Exercise', Exercise);
	
	Exercise.$inject = ['$http', '$scope', '$sce', '$stateParams', 'connection', 'listenersHandler', 'canvas'];
	
	function Exercise($http, $scope, $sce, $stateParams, connection, listenersHandler, canvas) {
		var exercise = this;
		
		exercise.lessonID = $stateParams.lessonID;
		exercise.id = $stateParams.exerciseID;
		exercise.isRunning = false;
		exercise.isPlaying = false;
		exercise.playedDemo = false;
		exercise.description = null;
		exercise.resultType = null;
		exercise.resultMsg = null;
		exercise.initialWorlds = {};
		exercise.answerWorlds = {};
		exercise.currentWorlds = {};
		exercise.currentWorld = null;
		exercise.currentWorldID = null;
		exercise.worldType = 'current';
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
	    	}
	    }
		
	    function setExercise(data) {
	    	exercise.id = data.id;
			exercise.description = $sce.trustAsHtml(data.description);
			exercise.code = data.code;
			exercise.currentWorldID = data.selectedWorldID;
			for(var worldID in data.initialWorlds) {
				exercise.initialWorlds[worldID] = {};
				var initialWorld = data.initialWorlds[worldID];
				var world;
				switch(initialWorld.type) {
					case 'BuggleWorld':
						world = new BuggleWorld(initialWorld.type, initialWorld.width, initialWorld.height, initialWorld.cells, initialWorld.entities);
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
	    
	    function setCurrentWorld(worldType) {
	    	exercise.worldType = worldType;
	    	exercise.currentWorld = exercise[exercise.worldType+'Worlds'][exercise.currentWorldID];
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
			exercise.isRunning = false;
		}
		
		function reset(worldID, worldType, keepOperations) {
			// We may want to keep the operations in order to replay the execution
			var operations = keepOperations === true ? exercise[worldType+'Worlds'][worldID].operations : [];
			var initialWorld = exercise.initialWorlds[worldID];
			exercise[worldType+'Worlds'][worldID] = initialWorld.clone();
			exercise.currentWorld = exercise[worldType+'Worlds'][worldID];
			exercise.currentWorld.operations = operations;
			exercise.currentState = -1;
			canvas.setWorld(exercise.currentWorld);
		}
		
		function replay() {
			exercise.isPlaying = true;
			reset(exercise.currentWorldID, exercise.worldType, true);
			startUpdateViewLoop();
		}
		
		
		function storeOperations(worldID, operations, worldType) {
			var step = [];
			for(var i=0; i<operations.length; i++) {
				var operation = operations[i];
				var result;
				switch(operation.type) {
					case 'moveBuggleOperation':
						result = new MoveBuggleOperation(operation.buggleID, operation.newX, operation.newY, operation.oldX, operation.oldY);
						break;
					case 'changeBuggleDirection':
						result = new ChangeBuggleDirection(operation.buggleID, operation.newDirection, operation.oldDirection);
						break;
					case 'changeBuggleCarryBaggle':
						result = new ChangeBuggleDirection(operation.buggleID, operation.newCarryBaggle, operation.oldCarryBaggle);
						break;
					case 'changeCellColor': 
						result = new ChangeCellColor(operation.cell.x, operation.cell.y, operation.newColor, operation.oldColor);
						break;
					case 'changeCellHasBaggle': 
						result = new ChangeCellHasBaggle(operation.cell.x, operation.cell.y, operation.newHasBaggle, operation.oldHasBaggle);
						break;
				}
				step.push(result);
			}
			exercise[worldType+'Worlds'][worldID].operations.push(step);
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
	}
	
	
	var ChangeCellHasBaggle = function (x, y, newHasBaggle, oldHasBaggle) {
		this.x = x;
		this.y = y;
		this.newHasBaggle = newHasBaggle;
		this.oldHasBaggle = oldHasBaggle;
	};
	
	ChangeCellHasBaggle.prototype.apply = function (currentWorld) {
		var cell = currentWorld.cells[this.x][this.y];
		cell.hasBaggle = this.newHasBaggle;
	};
	
	ChangeCellHasBaggle.prototype.reverse = function (currentWorld) {
		var cell = currentWorld.cells[this.x][this.y];
		cell.hasBaggle = this.oldHasBaggle;
	};
	
	var ChangeCellColor = function (x, y, newColor, oldColor) {
		this.x = x;
		this.y = y;
		this.newColor = newColor;
		this.oldColor = oldColor;
	};
	
	ChangeCellColor.prototype.apply = function (currentWorld) {
		var cell = currentWorld.cells[this.x][this.y];
		cell.color = this.newColor;
	};
	
	ChangeCellColor.prototype.reverse = function (currentWorld) {
		var cell = currentWorld.cells[this.x][this.y];
		cell.color = this.oldColor;
	};
	
	var ChangeBuggleCarryBaggle = function (buggleID, newCarryBaggle, oldCarryBaggle) {
		this.buggleID = buggleID;
		this.newCarryBaggle = newCarryBaggle;
		this.oldCarryBaggle = oldCarryBaggle;
	};
	
	ChangeBuggleCarryBaggle.prototype.apply = function (currentWorld) {
		var buggle = currentWorld.buggles[this.buggleID];
		buggle.carryBaggle = this.newCarryBaggle;
	};
	
	ChangeBuggleCarryBaggle.prototype.reverse = function (currentWorld) {
		var buggle = currentWorld.buggles[this.buggleID];
		buggle.carryBaggle = this.oldCarryBaggle;
	};
	
	var MoveBuggleOperation = function (buggleID, newX, newY, oldX, oldY) {
		this.buggleID = buggleID;
		this.newX = newX;
		this.newY = newY;
		this.oldX = oldX;
		this.oldY = oldY;
	};
	
	MoveBuggleOperation.prototype.apply = function (currentWorld) {
		var buggle = currentWorld.buggles[this.buggleID];
		buggle.x = this.newX;
		buggle.y = this.newY;
	};
	
	MoveBuggleOperation.prototype.reverse = function (currentWorld) {
		var buggle = currentWorld.buggles[this.buggleID];
		buggle.x = this.oldX;
		buggle.y = this.oldY;
	};
	
	var ChangeBuggleDirection = function (buggleID, newDirection, oldDirection) {
		this.buggleID = buggleID;
		this.newDirection = newDirection;
		this.oldDirection = oldDirection;
	};
	
	ChangeBuggleDirection.prototype.apply = function (currentWorld) {
		var buggle = currentWorld.buggles[this.buggleID];
		buggle.setDirection(this.newDirection);
	};
	
	ChangeBuggleDirection.prototype.reverse = function (currentWorld) {
		var buggle = currentWorld.buggles[this.buggleID];
		buggle.setDirection(this.oldDirection);
	};
	
	var BuggleWorldCell = function(x, y, color, hasBaggle, hasContent, hasLeftWall, hasTopWall) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.hasBaggle = hasBaggle;
		this.hasContent = hasContent;
		this.hasLeftWall = hasLeftWall;
		this.hasTopWall = hasTopWall;
	};
	
	BuggleWorldCell.prototype.draw = function (ctx, canvasWidth, canvasHeight, width, height) {
		var xLeft = canvasWidth/width*this.x;
		var yTop = canvasHeight/height*this.y;
		
		var padX = canvasWidth/width/2;
		var padY = canvasHeight/height/2;
		
		var xRight = canvasWidth/width*(this.x+1);
		var yBottom = canvasHeight/height*(this.y+1);
		
		ctx.fillStyle = 'rgba('+this.color.join(',')+')';
		if(this.color[0] === 255 && this.color[1] === 255 && this.color[2] === 255 && this.color[3] === 255) {
			if((this.x+this.y)%2 === 0) {
				ctx.fillStyle = "rgb(230, 230, 230)";
			}
			else {
				ctx.fillStyle = "rgb(255, 255, 255)";
			}
		}
		ctx.fillRect(xLeft, yTop, xRight, yBottom);
		ctx.beginPath();
		ctx.lineWidth = 5;
		ctx.strokeStyle = 'SteelBlue';
		if(this.hasLeftWall) {
			ctx.moveTo(xLeft, yTop);
			ctx.lineTo(xLeft, yBottom);
		}
		if(this.hasTopWall) {
			ctx.moveTo(xLeft, yTop);
			ctx.lineTo(xRight, yTop);
		}
		
		ctx.stroke();
		ctx.closePath();
	
		if(this.hasBaggle) {
			ctx.beginPath(); 
			ctx.fillStyle=DefaultColors.BAGGLE;
			ctx.arc(xLeft+padX, yTop+padY, 30, 0, Math.PI*2, true);
			ctx.arc(xLeft+padX, yTop+padY, 15, 0, Math.PI*2, true);
			ctx.fill('evenodd');
			ctx.closePath();
		}
	};
	
	var Buggle = function (x, y, color, direction, carryBaggle) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.setDirection(direction)
		this.carryBaggle = carryBaggle;
	};
	
	Buggle.prototype.setDirection = function (direction) {
		switch(direction) {
			case Direction.NORTH_VALUE:
				this.src = '/assets/images/buggle-top.svg';
				break;
			case Direction.EAST_VALUE:
				this.src = '/assets/images/buggle-right.svg';
				break;
			case Direction.SOUTH_VALUE:
				this.src = '/assets/images/buggle-bot.svg';
				break;
			case Direction.WEST_VALUE:
				this.src = '/assets/images/buggle-left.svg';
				break;
			default:
				this.src = '/assets/images/buggle-top.svg';
		}
	};
	
	Buggle.prototype.draw = function (ctx, canvasWidth, canvasHeight, width, height) {
		var buggle = this;
		var img = new Image();
		img.onload = function() {
			buggle.drawBuggleImage(ctx, img, canvasWidth, canvasHeight, width, height);
		};
		img.src = this.src;
	};
	
	Buggle.prototype.drawBuggleImage = function (ctx, img, canvasWidth, canvasHeight, width, height) {
		var imgWidth = canvasWidth/width*0.7;
		var imgHeight = canvasHeight/height*0.7;
		
		var xLeft = canvasWidth/width*this.x +imgWidth/width;
		var yTop = canvasHeight/height*this.y +imgHeight/height;
		
		ctx.drawImage(img, xLeft, yTop, imgWidth, imgHeight);
		var imgData = ctx.getImageData(xLeft, yTop, imgWidth, imgHeight);
		var data = imgData.data;
		for(var i=0; i<data.length; i += 4) {
			// Only update buggle's pixels
			if(data[i] === 0 && data[i+1] === 0 && data[i+2] === 0) {
				data[i] = this.color[0];
				data[i+1] = this.color[1];
				data[i+2] = this.color[2];
				data[i+3] = this.color[3];
			}
		};
		ctx.putImageData(imgData, xLeft, yTop);
	};
	
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
	
	var DefaultColors = {
		BAGGLE: 'rgb(209, 105, 31);'
	};
	
	var OutcomeKind = {
		FAIL: 0,
		PASS: 1
	};
	
	var Direction = {
		NORTH_VALUE: 0,
		EAST_VALUE: 1,
		SOUTH_VALUE: 2,
		WEST_VALUE: 3
	};
})();