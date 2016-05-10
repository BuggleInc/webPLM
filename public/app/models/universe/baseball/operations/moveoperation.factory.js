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

		MoveOperation.prototype.apply = function(currentWorld)
		{
			currentWorld.move = this.base * currentWorld.positionsAmount + this.position;
			this.oldBase = currentWorld.holeBase;
			this.oldPosition = currentWorld.holePosition;
			currentWorld.field[currentWorld.holeBase*currentWorld.positionsAmount + currentWorld.holePosition] = currentWorld.field[this.base * currentWorld.positionsAmount + this.position];
			currentWorld.field[this.base * currentWorld.positionsAmount + this.position] = -1;
			currentWorld.oldBase = currentWorld.holeBase;
			currentWorld.oldPosition = currentWorld.holePosition;
			currentWorld.holeBase = this.base;
			currentWorld.holePosition = this.position;
			currentWorld.isReverse = false;
			currentWorld.oldMove = currentWorld.oldBase * currentWorld.positionsAmount + currentWorld.oldPosition;
			currentWorld.moveCount++;
			var stock = [];
			for(var i=0;i<currentWorld.field.length;i++)
			{
				stock.push(currentWorld.field[i]);
			}
			currentWorld.memory.push(stock);
		};

		MoveOperation.prototype.reverse = function(currentWorld)
		{
			var index = currentWorld.memory.indexOf(currentWorld.memory[currentWorld.memory.length-1]);
			if(index > -1) {
				currentWorld.memory.splice(index,1);
			}
			currentWorld.oldBase = this.base;
			currentWorld.oldPosition = this.position;
			currentWorld.holeBase = this.oldBase
			currentWorld.holePosition = this.oldPosition;
			currentWorld.move = this.oldBase*currentWorld.positionsAmount + this.oldPosition;
			currentWorld.oldMove = currentWorld.holeBase*currentWorld.positionsAmount + currentWorld.holePosition;
			currentWorld.field[this.base*currentWorld.positionsAmount + this.position] = currentWorld.field[this.oldBase*currentWorld.positionsAmount + this.oldPosition];
			currentWorld.field[this.oldBase*currentWorld.positionsAmount + this.oldPosition] = -1;
			currentWorld.isReverse = true;
			currentWorld.moveCount--;
		};

		return MoveOperation;
	}
})();
