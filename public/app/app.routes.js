(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.config(config);
	
	function config ($stateProvider, $urlRouterProvider) {
	    // catch all non-supported routes
	    // redirect user to the home page 
	    $urlRouterProvider.otherwise('/');

	    $stateProvider
	        .state('home', {
	            url: '/',
	            templateUrl: 'assets/app/home/home.html',
	            controller: 'Home',
	            controllerAs: 'home'
	        })
	        .state('signIn', {
	            url: '/ui/signIn',
	            templateUrl: 'assets/app/sign-in/sign-in.html',
	            controller: 'SignIn',
	            controllerAs: 'signIn'
	        })
	        .state('signUp', {
	            url: '/ui/signUp',
	            templateUrl: 'assets/app/sign-up/sign-up.html',
	            controller: 'SignUp',
	            controllerAs: 'signUp'
	        })
	        .state('profile', {
	            url: '/ui/profile',
	            templateUrl: 'assets/app/profile/profile.html',
	            controller: 'Profile',
	            controllerAs: 'profile'
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
	        })
            .state('editor', {
                url: '/ui/editor',
                templateUrl: 'assets/app/editor/editor.html',
                controller: 'Editor',
                controllerAs: 'editor'
            })
            .state('editorLoadExercise', {
                url: '/ui/editor/:lessonID/:exerciseID',
                templateUrl: 'assets/app/editor/editor.html',
                params: {
		            lessonID: {value: null, squash: false},
		            exerciseID: {value: '', squash: false}
		        },
                controller: 'Editor',
                controllerAs: 'editor'
            });
	}
})();