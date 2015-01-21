(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeBuggleCarryBaggle', ChangeBuggleCarryBaggle);
	
	function ChangeBuggleCarryBaggle () {
		
		var ChangeBuggleCarryBaggle = function (buggleID, newCarryBaggle, oldCarryBaggle) {
			this.buggleID = buggleID;
			this.newCarryBaggle = newCarryBaggle;
			this.oldCarryBaggle = oldCarryBaggle;
		};
		
		ChangeBuggleCarryBaggle.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.buggles[this.buggleID];
			buggle.carryBaggle = this.newCarryBaggle;
		};
		
		ChangeBuggleCarryBaggle.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.buggles[this.buggleID];
			buggle.carryBaggle = this.oldCarryBaggle;
		};
	
		return ChangeBuggleCarryBaggle;
	}
})();