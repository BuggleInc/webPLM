(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Home', Home);
	
	Home.$inject = ['$http', '$scope', '$location', '$sce', 'connection', 'listenersHandler'];
	
	function Home($http, $scope, $location, $sce, connection, listenersHandler) {
	    var home = this;
			    
		home.lessons = [];
		home.currentLesson = null;
	    home.currentExerciseID = '';
		
	    home.getLessons = getLessons;
	    home.setLessons = setLessons;
	    home.setCurrentLesson = setCurrentLesson;
	    home.goToLesson = goToLesson;

	    var offHandleMessage = listenersHandler.register('onmessage', connection.setupMessaging(handleMessage));
	    
	    getLessons();
	    
	    function handleMessage(data) {
	    	var cmd = data.cmd;
	    	var args = data.args;

	    	console.log('message received: ', data);
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
	    
	    function goToLesson () {
	    	$location.path('ui/lessons/'+home.currentLesson.id);
	    }

	    $scope.$on('$destroy',function() {
	    	offHandleMessage();
    	});
	}
})();