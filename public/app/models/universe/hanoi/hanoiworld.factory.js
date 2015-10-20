(function () {
	'use strict';

	angular
		.module('PLMApp')
		.factory('HanoiWorld', HanoiWorld);

  HanoiWorld.$inject = ['HanoiDisk', 'HanoiMove'];

	function HanoiWorld(HanoiDisk, HanoiMove) {
    
		var HanoiWorld = function (world) {
			var slot, hanoiDisk, i, j;
      this.type = world.type;
			this.operations = [];
			this.currentState = -1;
			this.moveCount = world.moveCount;
			this.slots = [];
			for (i = 0; i < world.slots.length; i += 1) {
				slot = [];
				for (j = 0; j < world.slots[i].length; j += 1) {
          hanoiDisk = new HanoiDisk(world.slots[i][j]);
					slot.push(hanoiDisk);
				}
				this.slots.push(slot);
			}
		};

		HanoiWorld.prototype.clone = function () {
			return new HanoiWorld(this);
		};

		HanoiWorld.prototype.addOperations = function (operations) {
			var i, generatedOperation, step;
      step = [];
			for (i = 0; i < operations.length; i += 1) {
				generatedOperation = this.generatedOperation(operations[i]);
				step.push(generatedOperation);
			}
			this.operations.push(step);
		};

		HanoiWorld.prototype.generatedOperation = function (operation) {
			switch (operation.type) {
		  case 'hanoiMove':
				return new HanoiMove(operation);
			}
		};

		HanoiWorld.prototype.setState = function (state) {
			var i, j, step;
			if (state < this.operations.length && state >= -1) {
				if (this.currentState < state) {
					for (i = this.currentState + 1; i <= state; i += 1) {
						step = this.operations[i];
						for (j = 0; j < step.length; j += 1) {
							step[j].apply(this);
						}
					}
				} else {
					for (i = this.currentState; i > state; i -= 1) {
            step = this.operations[i];
						for (j = 0; j < step.length; j += 1) {
							step[j].reverse(this);
						}
					}
				}
				this.currentState = state;
			}
		};

		HanoiWorld.prototype.getEntity = function (entityID) {
			return this.entities[entityID];
		};

		return HanoiWorld;
	}
}());