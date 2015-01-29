(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.config(config);
	
	function config ($stateProvider, $urlRouterProvider) {
	    $stateProvider
	        .state('home', {
	            url: '/',
	            templateUrl: 'assets/app/home/home.html',
	            controller: 'Home',
	            controllerAs: 'home'
	        })
	        .state('exercise', {
	        	url: '/ui/lessons/:lessonID/:exerciseID',
	        	templateUrl: 'assets/app/exercise/exercise.html',
	        	params: {
		            lessonID: {value: null, squash: false},
		            exerciseID: {value: '', squash: false}
		        },
	        	controller: 'Exercise',
	        	controllerAs: 'exercise'
	        });
	    // catch all route
	    // send users to the home page 
	    $urlRouterProvider.otherwise('/');
	}
})();