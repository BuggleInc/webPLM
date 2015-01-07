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
	.controller('HomeController', ['$http', '$scope', '$sce', 'connection', 'listenersHandler', HomeController])
	.controller('ExerciseController', ['$http', '$scope', '$sce', '$stateParams', 'connection', 'listenersHandler', ExerciseController])
	.directive('lessonGallery', lessonGallery)
	.directive('lessonOverview', lessonOverview);
	
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
	}
	
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
	    			args: args | null
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
	}
	
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
	    		case 'lessons': setLessons(args.lessons);
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
	
	function ExerciseController($http, $scope, $sce, $stateParams, connection, listenersHandler) {
		var exercise = this;
		
		exercise.lessonID = $stateParams.lessonID;
		exercise.id = $stateParams.exerciseID;
		exercise.isRunning = false;
		exercise.description = null;
		exercise.resultType = null;
		exercise.resultMsg = null;
		
		exercise.runCode = runCode;
		
		var url = '/plm/lessons/'+exercise.lessonID;
		if(exercise.id !== "")
		{
			url += '/' + exercise.id;
		}
		
		$http.get(url).success(function (data) {
			console.log("Data! ", data);
			exercise.id = data.id;
			exercise.description = $sce.trustAsHtml(data.description);
			exercise.code = data.code;
	    });
		
		var offDisplayMessage = listenersHandler.register('onmessage', connection.setupMessaging(displayMessage));
	    send();
	    
	    function displayMessage(data) {
	    	console.log('data2: ', data);
	    };
	    
	    function send() {
	    	console.log('Sending "Youhou2"');
	    	listenersHandler.sendMessage('Youhou2');
	    };
	    
		function runCode () {
			var url = '/plm/lessons/'+ exercise.lessonID + '/' + exercise.id;
			var data = { code: exercise.code };
			
			exercise.isRunning = true;
			
			$http.put(url, data).success(function (result) {
				console.log(result);
				exercise.isRunning = false;
				/*
				exercise.resultType = result.type;
				exercise.resultMsg = result.msg;
			
				alert('resultType: '+ exercise.resultType);
				alert('resultMsg: '+ exercise.resultMsg);
				*/
			});
		};
		
		$scope.$on("$destroy",function() {
	    	offDisplayMessage();
    	});
	};
	
	
})();