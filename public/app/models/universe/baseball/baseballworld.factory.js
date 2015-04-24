(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('BaseballWorld',BaseballWorld);

		BaseballWorld.$inject = [ 'MoveOperation' ];

	function BaseballWorld(MoveOperation)
	{
		var BaseballWorld = function(world)
		{
			this.type = world.type;
			this.width = world.width;
			this.height = world.height;
			this.operations = [];
			this.currentState = -1;
			this.baseAmount = world.baseAmount;	
			this.posAmount = world.posAmount;
			this.field = [];
			for(var i=0; i<world.field.length;i++)
			{
				this.field.push(world.field[i]);
			}

			this.moveCount = world.moveCount;
		};

		BaseballWorld.prototype.clone = function()
		{
			return new BaseballWorld(this);
		};

		BaseballWorld.prototype.addOperations = function (operations)
		{
			var step = [];
			for(var i=0; i<operations.length;i++)
			{
				var generatedOperation = this.generatedOperation(operations[i]);
				step.push(generatedOperation);
			}
			this.operations.push(step);
		};

		BaseballWorld.prototype.generatedOperation = function (operation)
		{
			switch(operation.type) {
				case 'moveOperation':
					return new MoveOperation(operation);
			}
		};

		BaseballWorld.prototype.setState = function (state) {
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

		BaseballWorld.prototype.getEntity = function(entityID)
		{
			return this.entities[entityID];
		};

		return BaseballWorld;
	}

})();