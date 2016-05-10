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
			this.operations = [];
			this.currentState = -1;

			this.field = world.field.slice();
			this.initialField = world.initialField.slice();

			this.memory = [];
			this.memory.push(this.initialField);

			this.colors = [ '#0000FF', '#00FF00', 'rgb(255,0,255)', '#996600',
			'rgb(255,56,0)', '#333300', 'rgb(0,103,165)', 'rgb(201,0,22)',
			'rgb(111,78,55)','rgb(109,7,26)', 'rgb(155,150,10)',
			'rgb(75,0,130)', 'rgb(150,85,120)', '#FF3300', '#00FFFF', '#4C0000', '#242400', '#1A4C33',
			'#80804C', '#FF9900', '#CC0066', '#666699', '#009999', '#661A80', '#333329'];

			this.basesAmount = world.basesAmount;
			this.positionsAmount = world.positionsAmount;

			this.holeBase = world.holeBase;
			this.holePosition  = world.holePosition;
			this.moveCount = world.moveCount;

			this.move = -1;
			this.oldMove = -1;
			this.holeX = -1;
			this.holeY = -1;
			this.oldBase = -1;
			this.oldPosition = -1;
			this.isReverse = false;
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
			switch(operation.name) {
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
