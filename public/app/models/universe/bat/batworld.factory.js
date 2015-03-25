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

			this.initBatTests(world.batTests);
			this.updateVisibleTests();
		};
		
		BatWorld.prototype.clone = function () {
			return new BatWorld(this);
		};

		BatWorld.prototype.initBatTests = function (batTests) {
			this.batTests = [];
			for(var i=0; i<batTests.length; i++) {
				this.batTests.push(batTests[i]);
			}
		};

		BatWorld.prototype.updateBatTests = function (batTests) {
			for(var i=0; i<batTests.length; i++) {
				var test = batTests[i];
				this.batTests[i].answered = test.answered;
				this.batTests[i].correct = test.correct;
				this.batTests[i].test = test.test;
				this.batTests[i].visible = test.visible;
			}
		};

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
			this.operations.push(operations[0]); // Only expect one operation
		};


		BatWorld.prototype.setState = function (state) {
			this.updateBatTests(this.operations[0].batTests);
			this.updateVisibleTests();
			this.currentState = 0;
		};

		return BatWorld;
	}
})();