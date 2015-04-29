(function () 
{
	angular
		.module('PLMApp')
		.factory('MoveOperation', MoveOperation);

	function MoveOperation()
	{
		var MoveOperation = function(data)
		{
			this.base = data.base;
			this.position = data.position;
			this.oldBase = data.oldBase;
			this.oldPosition = data.oldPosition;
		}

		MoveOperation.prototype.apply = function (currentWorld)
		{
			var index = currentWorld.field.indexOf(-1);
			currentWorld.field[index] = currentWorld.field[this.base * currentWorld.posAmount + this.position];
			currentWorld.field[this.base * currentWorld.posAmount + this.position] = -1;
		};

		MoveOperation.prototype.reverse = function(currentWorld)
		{

		};

		return MoveOperation;
	}
})();