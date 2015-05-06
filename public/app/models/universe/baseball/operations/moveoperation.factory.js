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
		};

		MoveOperation.prototype.apply = function (currentWorld)
		{	currentWorld.move = this.base * currentWorld.posAmount + this.position;
			this.oldBase = currentWorld.holeBase;
			this.oldPosition = currentWorld.holePos;
			currentWorld.oldMove = this.oldBase*currentWorld.posAmount+this.oldPosition;
			currentWorld.field[currentWorld.holeBase*currentWorld.posAmount + currentWorld.holePos] = currentWorld.field[this.base * currentWorld.posAmount + this.position];
			currentWorld.field[this.base * currentWorld.posAmount + this.position] = -1;
			currentWorld.holeBase = this.base;
			currentWorld.holePos = this.position;
			currentWorld.moveCount++;
		};

		MoveOperation.prototype.reverse = function(currentWorld)
		{
			currentWorld.move = this.oldBase*currentWorld.posAmount + this.oldPosition;
			currentWorld.oldMove = currentWorld.holeBase*currentWorld.posAmount + currentWorld.holePos;
			currentWorld.field[this.base*currentWorld.posAmount + this.position] = currentWorld.field[this.oldBase*currentWorld.posAmount + this.oldPosition];
			currentWorld.field[this.oldBase*currentWorld.posAmount + this.oldPosition] = -1;
			currentWorld.holeBase = this.oldBase;
			currentWorld.holePos = this.oldPosition;
			currentWorld.moveCount--;
		};

		return MoveOperation;
	}
})();