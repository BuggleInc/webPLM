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
	.controller('HomeController', ['$http', '$sce', 'listenersHandler', HomeController])
	.controller('ExerciseController', ['$http', '$sce', '$stateParams', 'listenersHandler', ExerciseController])
	.directive('lessonGallery', lessonGallery)
	.directive('lessonOverview', lessonOverview);
	
	function listenersHandler($rootScope, connection) {
		var registeredListeners = [];
		
		var service = {
				register: register,
				sendMessage: sendMessage,
				closeConnection: closeConnection
			};
		return service;
		
		function register(action, fn) {
		    registeredListeners.push(action);
		    $rootScope.$on(action, function (event, data) {
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
		
		var service = {
			sendMessage: sendMessage,
			setupMessaging: setupMessaging,
			endConnection: endConnection
		};		
		
		socket.onopen = function (event) {
			$rootScope.$emit('onopen', event);
		};
		
		socket.onmessage = function (event) {
			$rootScope.$emit('onmessage', event);
		};
		
		return service;
		
		function sendMessage(msg) {
			socket.send(msg);
		};
		
		function setupMessaging(fn) {
		    socket.onmessage = function (event) {
			    //var msg = JSON.parse(event.data);
			    //fn(msg);
		    	fn(event.data);
		    };
		};
		
		function endConnection() {
			socket.close();
		}
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
		}
	};
	
	
	function HomeController($http, $sce, listenersHandler){
	    var home = this;
			    
		home.lessons = [];
		home.currentLesson = null;
	    home.currentExercise = null;
		
	    home.setCurrentLesson = setCurrentLesson;
	    
	    
	    $http.get('/plm/lessons').success(function (data) {
	    	home.lessons = data.map(function (lesson) {
	    	  lesson.description = $sce.trustAsHtml(lesson.description);
	    	  return lesson;
	    	});
	    });
	    
	    listenersHandler.register('onopen', send);
	    listenersHandler.register('onmessage', displayMessage);
	    	    
	    function displayMessage(data) {
	    	console.log('data: ', data);
	    };
	    
	    function send() {
	    	console.log('Sending "Youhou"');
	    	listenersHandler.sendMessage('Youhou');
	    };
	    
	    function setCurrentLesson (lesson) {
	    	home.currentLesson = lesson;
	    };
	    
	};
	
	function ExerciseController($http, $sce, $stateParams, listenersHandler){
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
		
		listenersHandler.register('onopen', send);
	    listenersHandler.register('onmessage', displayMessage);
	    
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
		
	};
	
	
})();