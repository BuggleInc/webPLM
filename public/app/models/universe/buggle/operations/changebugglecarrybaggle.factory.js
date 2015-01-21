(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeBuggleCarryBaggle', ChangeBuggleCarryBaggle);
	
	function ChangeBuggleCarryBaggle () {
		
		var ChangeBuggleCarryBaggle = function (data) {
			this.buggleID = data.buggleID;
			this.newCarryBaggle = data.newCarryBaggle;
			this.oldCarryBaggle = data.oldCarryBaggle;
		};
		
		ChangeBuggleCarryBaggle.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.carryBaggle = this.newCarryBaggle;
		};
		
		ChangeBuggleCarryBaggle.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.carryBaggle = this.oldCarryBaggle;
		};
	
		return ChangeBuggleCarryBaggle;
	}
})();