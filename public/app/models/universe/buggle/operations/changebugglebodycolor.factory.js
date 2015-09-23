(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeBuggleBodyColor', ChangeBuggleBodyColor);
  
	function ChangeBuggleBodyColor () {
		
		var ChangeBuggleBodyColor = function (data) {
			this.buggleID = data.buggleID;
      this.newColor = data.newColor;
			this.oldColor = data.oldColor;
		};
		
    ChangeBuggleBodyColor.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.getEntity(this.buggleID);
			buggle.color = this.newColor;
		};
		
		ChangeBuggleBodyColor.prototype.reverse = function (currentWorld) {
      var buggle = currentWorld.getEntity(this.buggleID);
			buggle.color = this.oldColor;
		};
	
		return ChangeBuggleBodyColor;
	}
})();