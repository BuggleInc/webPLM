(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('PancakeWorld',PancakeWorld);

		PancakeWorld.$inject = [ 'FlipOperation' ];

	function PancakeWorld(FlipOperation)
	{
		var PancakeWorld = function(world)
		{
			this.type = world.type;
			this.operations = [];
			this.currentState = -1;
			this.pancakeStack = [];
			for(var i=0;i<world.pancakeStack.length;i++)
			{
				this.pancakeStack.push(world.pancakeStack[i]);
			}

			this.moveCount = world.moveCount;

			this.numberFlip = world.numberFlip ;

			this.burnedWorld = world.burnedWorld;
		};

		PancakeWorld.prototype.clone = function()
		{
			return new PancakeWorld(this);
		};

		PancakeWorld.prototype.addOperations = function (operations)
		{
			var step = [];
			for(var i=0; i<operations.length;i++)
			{
				var generatedOperation = this.generatedOperation(operations[i]);
				step.push(generatedOperation);
			}
			this.operations.push(step);
		};

		PancakeWorld.prototype.generatedOperation = function (operation)
		{
			switch(operation.type) {
				case 'flipOperation':
					return new FlipOperation(operation);
			}
		};

		PancakeWorld.prototype.setState = function (state) {
			var i;
			var j;
			var step;
			if(state < this.operations.length && state >= -1) {
				if(this.currentState < state) {
					for(i=this.currentState+1; i<=state; i++) {
						step = this.operations[i];
						for(j=0; j<step.length; j++) {
							step[j].apply(this);
						}
					}
				}
				else {
					for(i=this.currentState; i>state; i--) {
						step = this.operations[i];
						for(j=0; j<step.length; j++) {
							step[j].reverse(this);
						}
					}
				}
				this.currentState = state;
			}
		};

		return PancakeWorld;
	}
})();