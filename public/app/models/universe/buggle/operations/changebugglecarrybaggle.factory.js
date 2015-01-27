(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeBuggleCarryBaggle', ChangeBuggleCarryBaggle);
	
	function ChangeBuggleCarryBaggle () {
		
		var ChangeBuggleCarryBaggle = function (data) {
			this.buggleID = data.buggleID;
			this.newCarryBaggle = data.newCarryBaggle;
			this.oldCarryBaggle = data.oldCarryBaggle;
			this.firstApply = true;
		};
		
		ChangeBuggleCarryBaggle.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.carryBaggle = this.newCarryBaggle;
			if(this.firstApply) {
				var msg = '';
				if(this.newCarryBaggle) {
					msg= 'Buggle '+this.buggleID+' is now carrying a baggle!';	
				}
				else {
					msg = 'Buggle '+this.buggleID+' drops the baggle.';
				}
				var obj = {
					step: currentWorld.steps.length,
					msg: msg
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}
		};
		
		ChangeBuggleCarryBaggle.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.carryBaggle = this.oldCarryBaggle;
		};
	
		return ChangeBuggleCarryBaggle;
	}
})();