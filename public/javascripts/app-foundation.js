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
	
	.controller('HomeController', ['$http', '$sce', HomeController])
	.controller('ExerciseController', ['$http', '$sce', '$stateParams', ExerciseController])
	.directive('lessonGallery', lessonGallery)
	.directive('lessonOverview', lessonOverview);
	
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
	
	
	function HomeController($http, $sce){
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
	    
	    function setCurrentLesson (lesson) {
	    	home.currentLesson = lesson;
	    };
	    
	};
	
	function ExerciseController($http, $sce, $stateParams){
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