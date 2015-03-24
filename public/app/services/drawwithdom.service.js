(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('drawWithDOM', drawWithDOM);
	
	drawWithDOM.$inject = ['$rootScope', '$compile']

	function drawWithDOM ($rootScope, $compile) {
		var drawingArea;
		var currentWorld;
				
		var draw;
		var scope; // Need to get the controller's scope to alter the DOM

		var service = {
				init: init,
				setWorld: setWorld,
				update: update,
				getWorld: getWorld,
				draw: draw
		};
		
		return service;
		
		function init(domElt, otherScope) {
			drawingArea = domElt;
			scope = otherScope;
		}

		function setWorld (world) {
			currentWorld = world;
			switch(currentWorld.type) {
				case 'BatWorld':
					draw = drawBatWorld;
					break;
			}
			update();
		}
		
		function getWorld() {
			return currentWorld;
		}

		function update() {
			drawingArea.html('');
			draw(currentWorld);
		}

		function drawBatWorld(batWorld) {
			var html = '<span ng-repeat="test in exercise.currentWorld.visibleTests" ng-class="{ passed: test.correct, failed: test.answered && !test.correct }">{{test.test}}<br></span>';
			var el = $compile(html)(scope);
			drawingArea.append(el);
		}
	}
})();