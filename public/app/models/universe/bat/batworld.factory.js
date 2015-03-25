(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BatWorld', BatWorld);
		
	function BatWorld () {
		
		var BatWorld = function (world) {
			this.type = world.type;
			this.operations = [];
			this.currentState = -1;

			this.updateBatTests(world.batTests);
			this.updateVisibleTests();
		};
		
		BatWorld.prototype.clone = function () {
			return new BatWorld(this);
		};

		BatWorld.prototype.updateBatTests = function (batTests) {
			this.batTests = [];
			for(var i=0; i<batTests.length; i++) {
				var test = batTests[i];
				this.batTests.push({
					"answered": test.answered,
					"correct": test.correct,
					"test": test.test,
					"visible": test.visible
				});
			}
		}

		BatWorld.prototype.updateVisibleTests = function () {
			this.visibleTests = [];
			var foundError = false;
			for(var i=0; i<this.batTests.length; i++) {
				var test = this.batTests[i];
				if(test.visible || (test.answered && !foundError)) {
					this.visibleTests.push(test);
					if(test.answered && !test.correct) {
						foundError = true;
					}
				}
			}
		};
		
		BatWorld.prototype.addOperations = function (operations) {
			this.updateBatTests(operations[0].batTests);
			this.updateVisibleTests();
		};
		
		BatWorld.prototype.setState = function () {
			// Do nothing...
		};

		return BatWorld;
	}
})();