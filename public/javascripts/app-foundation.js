(function () {	
	'use strict';
	
	angular.module('PLMApp', ['ui.router', 'ui.codemirror'])

	.config(function($stateProvider, $urlRouterProvider) {
	    
	    $stateProvider
	        .state('home', {
	            url: '/',
	            templateUrl: 'assets/partials/home.html',
	            controller: 'HomeController',
	            controllerAs: 'home'
	        })
	        .state('exercise', {
	        	url: '/ui/lessons/:lessonID',
	        	templateUrl: 'assets/partials/exercise.html',
	        	controller: 'ExerciseController',
	        	controllerAs: 'exercise'
	        })
	        .state('exercise.current', {
	        	url: '/:exerciseID'
	        });
	    // catch all route
	    // send users to the home page 
	    $urlRouterProvider.otherwise('/');
	})
	.factory('connection', ['$rootScope', connection])
	.factory('listenersHandler', ['$rootScope', 'connection', listenersHandler])
	.factory('canvas', canvas)
	.controller('HomeController', ['$http', '$scope', '$sce', 'connection', 'listenersHandler', HomeController])
	.controller('ExerciseController', ['$http', '$scope', '$sce', '$stateParams', 'connection', 'listenersHandler', 'canvas', ExerciseController])
	.directive('lessonGallery', lessonGallery)
	.directive('lessonOverview', lessonOverview)
	.directive('worldsView', worldsView);
	
	
	function listenersHandler($rootScope, connection) {
		var registeredListeners = [];
		
		var service = {
				register: register,
				closeConnection: closeConnection,
		};
		return service;
		
		function register(action, fn) {
		    registeredListeners.push(action);
		    return $rootScope.$on(action, function (event, data) {
		        $rootScope.$apply(function () {
		            fn(data);
		        });
		    });
		};
		
		function sendMessage(msg) {
			connection.sendMessage(msg);
		};
		
		function destroyListeners() {
		    registeredListeners.forEach(function (value) {
		        $rootScope.$$listeners[value] = [];
		    });
		    registeredListeners = [];
		};
		
		function closeConnection() {
		   destroyListeners();
		   connection.endConnection();
		};
	};
	
	function connection ($rootScope) {		
		var socket = new WebSocket('ws://localhost:9000/websocket');
		var connectStatus = false;
		var pendingMessages = [];
		
		var service = {
			sendMessage: sendMessage,
			setupMessaging: setupMessaging,
			endConnection: endConnection
		};
		
		socket.onopen = function (event) {
			connectStatus = true;
			sendPendingMessages();
			$rootScope.$emit('onopen', event);
		};
		
		return service;
		
		function sendMessage(cmd, args) {
			var msg = {
	    			cmd: cmd,
	    			args: args || null
	    	};
	    	send(JSON.stringify(msg));
		};
		
		function send(msg) {
			if(!connectStatus) {
				pendingMessages.push(msg);
			}
			else {
				console.log('message sent: ', msg);
				socket.send(msg);
			}
		};
		
		function setupMessaging(fn) {
		    socket.onmessage = function (event) {
		    	var msg = JSON.parse(event.data);
			    
			    // Has to use $apply to warn AngularJS 
			    // that the model could have been updated
			    $rootScope.$apply(function () {
			    	fn(msg);
			    });
		    };
		};
		
		function sendPendingMessages() {
			pendingMessages.map(send);
		};
		
		function endConnection() {
			socket.close();
		};
	};
	
	function canvas () {
		var canvas;
		var ctx;
		var currentWorld;
		
		var bw;
		var bh;
		var p;
		
		var service = {
				init: init,
				setWorld: setWorld,
				update: update
		};
		
		return service;
		
		function init() {
			canvas = document.getElementById('worldView');
			ctx = canvas.getContext('2d');
			bw = 400;
			bh = 400;
			p = 0;
			console.log('On va dessiner!');
			drawGrid();
			//drawBoard();
		}
		
		function setWorld (world) {
			currentWorld = world;
			update();
		};
		
		function update() {
			currentWorld.draw(ctx);
		};
		
		function drawGrid() {
			for(var i=0; i<6; i++) {
				for(var j=0; j<6; j++) {
					var x1 = bh/6*i;
					var y1 = bw/6*j;
					
					var x2 = bh/6*(i+1);
					var y2 = bw/6*(j+1);
					
					if((i+j)%2 === 0) {
						ctx.fillStyle = "rgb(230, 230, 230)";
					}
					else {
						ctx.fillStyle = "rgb(255, 255, 255)";
					}
					
					ctx.fillRect(x1, y1, x2, y2);
					if(i === 3 && j === 3) {
						ctx.lineWidth = 5;
						ctx.strokeStyle = "blue";
						ctx.moveTo(x1, y1);
						ctx.lineTo(x2, y1);
					}
				}
			}
			ctx.stroke();
		}
		
		function drawBoard(){
			for (var i = 0; i <= 6; i++) {
				var x = bh/6*i;
			    ctx.moveTo(0.5 + x + p, p);
			    ctx.lineTo(0.5 + x + p, bh + p);
			}

			ctx.moveTo(bh, 0);
			ctx.lineTo(bh, bw);

			for (var i = 0; i <= 6; i++) {
				var y = bw/6*i
				ctx.moveTo(p, 0.5 + y + p);
			    ctx.lineTo(bw + p, 0.5 + y + p);
			}
			
			ctx.moveTo(0, bw);
			ctx.lineTo(bw, bh);
			
			ctx.strokeStyle = 'black';
			ctx.stroke();
		}
		
	};
	
	function lessonGallery () {
		return {
			restrict: 'E',
			templateUrl: '/assets/templates-foundation/lesson-gallery-foundation.html'
		};
	};
	
	function lessonOverview () {
		return {
			restrict: 'E',
			templateUrl: '/assets/templates-foundation/lesson-overview-foundation.html'
		};
	};
	
	function worldsView() {
		return {
			restrict: 'E',
			templateUrl: '/assets/templates-foundation/worlds-view.html'
		}
	};
	
	
	function HomeController($http, $scope, $sce, connection, listenersHandler) {
	    var home = this;
			    
		home.lessons = [];
		home.currentLesson = null;
	    home.currentExercise = null;
		
	    home.getLessons = getLessons;
	    home.setLessons = setLessons;
	    home.setCurrentLesson = setCurrentLesson;
	    
	    var offHandleMessage = listenersHandler.register('onmessage', connection.setupMessaging(handleMessage));
	    
	    getLessons();
	    
	    function handleMessage(data) {
	    	console.log('message received: ', data);
	    	var cmd = data.cmd;
	    	var args = data.args;
	    	switch(cmd) {
	    		case 'lessons': 
	    			setLessons(args.lessons);
	    			break;
	    	}
	    };
	    
	    function getLessons() {
	    	connection.sendMessage('getLessons', null);
	    };
	    
	    function setLessons(lessons) {
	    	home.lessons = lessons.map(function (lesson) {
	    	  lesson.description = $sce.trustAsHtml(lesson.description);
	    	  return lesson;
	    	});
	    	console.log('updated home.lessons: ', home.lessons);
	    };
	    
	    function setCurrentLesson (lesson) {
	    	home.currentLesson = lesson;
	    };
	    
	    $scope.$on("$destroy",function() {
	    	offHandleMessage();
    	});
	};
	
	function ExerciseController($http, $scope, $sce, $stateParams, connection, listenersHandler, canvas) {
		var exercise = this;
		
		exercise.lessonID = $stateParams.lessonID;
		exercise.id = $stateParams.exerciseID;
		exercise.isRunning = false;
		exercise.description = null;
		exercise.resultType = null;
		exercise.resultMsg = null;
		
		exercise.runCode = runCode;
		
		function getExercise() {
			var args = {
					lessonID: exercise.lessonID,
			};
			if(exercise.id !== "")
			{
				args.exerciseID = exercise.id;
			}
	    	connection.sendMessage('getExercise', args);
	    };
		
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
	    		case 'operations':
	    			displayOperations(args.msg);
	    			break;
	    	}
	    };
	    
	    function setExercise(data) {
	    	exercise.id = data.id;
			exercise.description = $sce.trustAsHtml(data.description);
			exercise.code = data.code;
			
			canvas.init();
	    };
	    
		function runCode() {
			var args = {
					lessonID: exercise.lessonID,
					exerciseID: exercise.id,
					code: exercise.code
			};
			connection.sendMessage("runExercise", args);
			exercise.isRunning = true;
		};
		
		function displayResult(msgType, msg) {
			console.log(msgType, ' - ', msg);
			exercise.isRunning = false;
		}
		
		function displayOperations(operations) {
			console.log('operations: ', operations);
		}
		
		$scope.$on("$destroy",function() {
	    	offDisplayMessage();
    	});
	};
	
	
})();