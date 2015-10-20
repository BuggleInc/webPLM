(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('SortingWorld', SortingWorld);

	SortingWorld.$inject = [ 'SetValOperation', 'SwapOperation','CopyOperation', 'CountOperation', 'GetValueOperation'
	];

	function SortingWorld(SetValOperation, SwapOperation, CopyOperation, CountOperation, GetValueOperation)
	{
		var SortingWorld = function(world)
		{
			this.type = world.type;
			this.operations = [];
			this.currentState = -1;
			this.readCount = world.readCount;
			this.writeCount = world.writeCount;
			
			this.values = [];
			for(var i=0;i<world.values.length;i++)
			{
				this.values.push(world.values[i]);
			}

			this.initValues = [];

			//contains each array of values after an operation
			this.memory = [];
			for(var i=0;i<world.values.length;i++)
			{
				this.initValues.push(world.values[i]);
			}

			this.memory.push(this.initValues);

			this.colors = ['#0000FF', '#FF0000', '#FFFF00',
			'#00FF00', '#00FFFF', '#FF00FF','#663300', '#336699', '#993366', '#666699' ];
		};

		SortingWorld.prototype.clone = function()
		{
			return new SortingWorld(this);
		};

		SortingWorld.prototype.addOperations = function (operations)
		{
			var step = [];
			for(var i=0; i<operations.length;i++)
			{
				var generatedOperation = this.generatedOperation(operations[i]);
				step.push(generatedOperation);
			}
			this.operations.push(step);
		};

		SortingWorld.prototype.generatedOperation = function (operation)
		{
			switch(operation.type) {
				case 'copyOperation':
					return new CopyOperation(operation);
				case 'setValOperation':
					return new SetValOperation(operation);
				case 'swapOperation':
					return new SwapOperation(operation);
				case 'countOperation':
					return new CountOperation(operation);
				case 'getValueOperation' :
					return new GetValueOperation(operation);
			}
		};

		SortingWorld.prototype.setState = function (state) {
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

		return SortingWorld;
	}
})();