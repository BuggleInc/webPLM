(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('HanoiDisk', HanoiDisk);
	
	function HanoiDisk() {
		
		var HanoiDisk = function (hanoiDisk) {
			this.size = hanoiDisk.size;
			this.color = hanoiDisk.color;
		};
		
		return HanoiDisk;
	}
}());