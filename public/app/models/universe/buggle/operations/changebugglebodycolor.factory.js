(function(){
	'use strict';

	angular
		.module('PLMApp')
		.factory('ChangeBuggleBodyColor', ChangeBuggleBodyColor);

	function ChangeBuggleBodyColor () {

		var ChangeBuggleBodyColor = function (data) {
			this.buggleID = data.buggleID;
      this.newColor = data.newBodyColor;
			this.oldColor = data.oldBodyColor;
		};

    ChangeBuggleBodyColor.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.getEntity(this.buggleID);
			buggle.bodyColor = this.newColor;
		};

		ChangeBuggleBodyColor.prototype.reverse = function (currentWorld) {
      var buggle = currentWorld.getEntity(this.buggleID);
			buggle.bodyColor = this.oldColor;
		};

		return ChangeBuggleBodyColor;
	}
})();
