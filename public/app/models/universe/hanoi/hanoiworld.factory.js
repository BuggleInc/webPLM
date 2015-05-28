(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('HanoiWorld',HanoiWorld);

		HanoiWorld.$inject = [ 'HanoiMove'];

	function HanoiWorld(HanoiMove)
	{
		var HanoiWorld = function(world)
		{
			this.type = world.type;
			this.width = world.width;
			this.height = world.height;
			this.operations = [];
			this.currentState = -1;
			console.log(world.slotVal);
			this.moveCount = world.moveCount;
			this.slotVal = [];
			for(var i=0;i<world.slotVal.length;i++)
			{
				var stock = [];
				for(var j=0;j<world.slotVal[i].length;j++)
				{
					stock.push(world.slotVal[i][j]);
				}
				this.slotVal.push(stock);
			}
		};

		HanoiWorld.prototype.clone = function()
		{
			return new HanoiWorld(this);
		};

		HanoiWorld.prototype.addOperations = function (operations)
		{
			var step = [];
			for(var i=0; i<operations.length;i++)
			{
				var generatedOperation = this.generatedOperation(operations[i]);
				step.push(generatedOperation);
			}
			this.operations.push(step);
		};

		HanoiWorld.prototype.generatedOperation = function (operation)
		{
			switch(operation.type) {
				case 'hanoiMove':
					return new HanoiMove(operation);
			}
		};

		HanoiWorld.prototype.setState = function (state) {
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

		HanoiWorld.prototype.getEntity = function(entityID)
		{
			return this.entities[entityID];
		};

		return HanoiWorld;
	}
})();