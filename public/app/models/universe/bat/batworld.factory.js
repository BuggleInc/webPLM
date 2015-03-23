(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BatWorld', BatWorld);
		
	function BatWorld () {
		
		var BatWorld = function (world) {
			this.type = world.type;
			this.batTests = [];
			this.visibleTests = [];

			this.updateBatTests(world.batTests);
			this.updateVisibleTests();
		};
		
		BatWorld.prototype.clone = function () {
			return new BatWorld(this);
		};

		BatWorld.prototype.updateBatTests = function (batTests) {
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
			var foundError = false;
			for(var i=0; i<this.batTests.length; i++) {
				var test = this.batTests[i];
				if(test.visible || !foundError) {
					this.visibleTests.push(test);
					if(test.answered && !test.correct) {
						foundError = true;
					}
				}
			}
			console.log('visibleTests: ', this.visibleTests);
		};
		
		BatWorld.prototype.addOperations = function (operations) {
			this.updateBatTests(operations[0].batTests);
			this.updateVisibleTests();
		};
		
		BatWorld.prototype.setState = function () {
			// Do nothing...
		};

		BatWorld.prototype.draw = function () {
			// Do nothing...
		};

		return BatWorld;
	}
})();