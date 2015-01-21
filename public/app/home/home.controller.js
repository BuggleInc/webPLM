(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Home', Home);
	
	Home.$inject = ['$http', '$scope', '$sce', 'connection', 'listenersHandler'];
	
	function Home($http, $scope, $sce, connection, listenersHandler) {
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
	    }
	    
	    function getLessons() {
	    	connection.sendMessage('getLessons', null);
	    }
	    
	    function setLessons(lessons) {
	    	home.lessons = lessons.map(function (lesson) {
	    	  lesson.description = $sce.trustAsHtml(lesson.description);
	    	  return lesson;
	    	});
	    	console.log('updated home.lessons: ', home.lessons);
	    }
	    
	    function setCurrentLesson (lesson) {
	    	home.currentLesson = lesson;
	    }
	    
	    $scope.$on("$destroy",function() {
	    	offHandleMessage();
    	});
	}
})();