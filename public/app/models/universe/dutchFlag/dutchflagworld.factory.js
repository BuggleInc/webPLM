(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('DutchFlagWorld', DutchFlagWorld);

	DutchFlagWorld.$inject = [];

	function DutchFlagWorld()
	{
		var DutchFlagWorld = function(world)
		{
			this.type = world.type;
			this.width = world.width;
			this.height = world.height;
			this.operations = [];
			this.currentState = -1;

			this.content = [];
			for(var i=0;i<world.content.length;i++)
			{
				this.content.push(world.content[i]);
			}

			this.moveCount = world.moveCount;
		};

		DutchFlagWorld.prototype.clone = function()
		{
			return new SortingWorld(this);
		}

		DutchFlagWorld.prototype.addOperations = function (operations)
		{
			var step = [];
			for(var i=0; i<operations.length;i++)
			{
				var generatedOperation = this.generatedOperation(operations[i]);
				step.push(generatedOperation);
			}
			this.operations.push(step);
		};

		DutchFlagWorld.prototype.generatedOperation = function (operation)
		{
			switch(operation.type) {
				case 'dutchFlagSwap':
					return new dutchFlagSwap(operation);
			}
		};

		DutchFlagWorld.prototype.setState = function (state) {
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

		DutchFlagWorld.prototype.getEntity = function(entityID)
		{
			return this.entities[entityID];
		}

		return DutchFlagWorld;
	}
})