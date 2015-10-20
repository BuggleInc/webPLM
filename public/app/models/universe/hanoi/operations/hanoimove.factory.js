(function () {
	'use strict';

	angular
		.module('PLMApp')
		.factory('HanoiMove', HanoiMove);

	function HanoiMove() {
		
    var HanoiMove = function (data) {
			this.source = data.source;
			this.destination = data.destination;
		};

		HanoiMove.prototype.apply = function (currentWorld) {
			var slot, disk;
      
      slot = currentWorld.slots[this.source];
      // Splice return an array
      disk = slot.splice(slot.length - 1, 1)[0];
			
      currentWorld.slots[this.destination].push(disk);
			currentWorld.moveCount += 1;
		};

		HanoiMove.prototype.reverse = function (currentWorld) {
			var slot, disk;
      
      slot = currentWorld.slots[this.destination];
      // Splice return an array
      disk = slot.splice(slot.length - 1, 1)[0];
			
      currentWorld.slots[this.source].push(disk);
			currentWorld.moveCount -= 1;
		};

		return HanoiMove;
	}
}());