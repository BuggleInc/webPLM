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
			this.oldBase = this.base;
			this.oldPosition = this.position;
			currentWorld.field[currentWorld.holeBase*currentWorld.posAmount + currentWorld.holePos] = currentWorld.field[this.base * currentWorld.posAmount + this.position];
			currentWorld.field[this.base * currentWorld.posAmount + this.position] = -1;
			currentWorld.holeBase = this.base;
			currentWorld.holePos = this.position;
			currentWorld.moveCount++;
		};

		MoveOperation.prototype.reverse = function(currentWorld)
		{
			
			currentWorld.field[currentWorld.holeBase*currentWorld.posAmount + currentWorld.holePos] = currentWorld.field[[this.oldBase*currentWorld.posAmount+this.oldPosition]];
			currentWorld.field[this.oldBase*currentWorld.posAmount+this.oldPosition] = -1;
			currentWorld.moveCount--;

		};

		return MoveOperation;
	}
})();