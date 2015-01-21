(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.config(config);
	
	function($stateProvider, $urlRouterProvider) {
	    $stateProvider
	        .state('home', {
	            url: '/',
	            templateUrl: 'assets/app/home/home.html',
	            controller: 'Home',
	            controllerAs: 'home'
	        })
	        .state('exercise', {
	        	url: '/ui/lessons/:lessonID',
	        	templateUrl: 'assets/app/exercise/exercise.html',
	        	controller: 'Exercise',
	        	controllerAs: 'exercise'
	        })
	        .state('exercise.current', {
	        	url: '/:exerciseID'
	        });
	    // catch all route
	    // send users to the home page 
	    $urlRouterProvider.otherwise('/');
	};
	
})();