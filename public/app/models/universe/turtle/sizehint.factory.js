(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('SizeHint', SizeHint);
	
	function SizeHint() {
		
		var SizeHint = function (sizeHint) {
			this.x1 = sizeHint.x1;
			this.y1 = sizeHint.y1;
      this.x2 = sizeHint.x2;
			this.y2 = sizeHint.y2;
      this.text = sizeHint.text;
		};
		
		return SizeHint;
	}
}());