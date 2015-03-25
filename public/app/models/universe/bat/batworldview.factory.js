(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BatWorldView', BatWorldView);

	BatWorldView.$inject = ['$compile'];

	function BatWorldView($compile) {
		
		var scope = null;

		var service = {
			draw: draw,
			setScope: setScope
		};

		return service;

		function draw(domElt, BatWorld) {
			if(!domElt.attr('data-batworldview')) {
				// We don't need to update the HTML once it has been appended
				// AngularJS take care of everything :-)
				domElt.attr('data-batworldview', true);
				var html = '<span ng-repeat="test in exercise.currentWorld.visibleTests" ng-class="{ passed: test.correct, failed: test.answered && !test.correct }">{{test.test}}<br></span>';
				var content = $compile(html)(scope);
				domElt.append(content);
			}
		}

		function setScope(otherScope) {
			scope = otherScope;
		}
	}
})();