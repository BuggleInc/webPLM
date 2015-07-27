(function(){
	'use strict';

	describe('FlipOperation', function() {
        var _FlipOperation;
        
        var currentWorld;
        var flipOperation;
        var number;
        var pancakeStack;
        var moveCount;
        var numberFlip;
        
        beforeEach(module('PLMApp'));
        
        beforeEach(inject(function(FlipOperation) {
			_FlipOperation = FlipOperation;
		}));
        
        beforeEach(function() {
            var i;
            var nbPancake;
            var memory;
            
            pancakeStack = [];
            nbPancake = getRandomInt(20) + 2;
            for(i = 0; i < nbPancake; i++) {
                pancakeStack.push({radius: i,upsideDown: true});
            }
            
            
            number = getRandomInt(nbPancake);
            moveCount = getRandomInt(42);
            numberFlip = getRandomInt(42);
            
            currentWorld = {
                pancakeStack: pancakeStack,
                moveCount: moveCount,
                numberFlip: numberFlip
            };
            
            var dataOperation = {
                number: number,
                oldNumber: numberFlip
			};
        
            flipOperation = new _FlipOperation(dataOperation);
        });
        
        it('should be initialized correctly by its constructor', function () {
            expect(flipOperation.number).toEqual(number);
            expect(flipOperation.oldNumber).toEqual(numberFlip);
		});

		it('should flip pancake between number and the end when applied', function () {
            var length = currentWorld.pancakeStack.length;
			flipOperation.apply(currentWorld);
            for (var i=1;i<=number;i++){
                expect(currentWorld.pancakeStack[length-i].radius).toEqual(length-number+i-1);
                expect(currentWorld.pancakeStack[length-i].upsideDown).toEqual(false);
            }
            for (var i=number+1;i<=length;i++){
                expect(currentWorld.pancakeStack[length-i].radius).toEqual(length-i);
                expect(currentWorld.pancakeStack[length-i].upsideDown).toEqual(true);
            }
            expect(currentWorld.moveCount).toEqual(moveCount+1);
            expect(currentWorld.numberFlip).toEqual(number);
		});

		it('should reflip pancake between number and the end when reversed', function () {
            var length = currentWorld.pancakeStack.length;
			flipOperation.reverse(currentWorld);
            for (var i=1;i<=number;i++){
                expect(currentWorld.pancakeStack[length-i].radius).toEqual(length-number+i-1);
                expect(currentWorld.pancakeStack[length-i].upsideDown).toEqual(false);
            }
            for (var i=number+1;i<=length;i++){
                expect(currentWorld.pancakeStack[length-i].radius).toEqual(length-i);
                expect(currentWorld.pancakeStack[length-i].upsideDown).toEqual(true);
            }
            expect(currentWorld.moveCount).toEqual(moveCount-1);
            expect(currentWorld.numberFlip).toEqual(numberFlip);
		});
        
        it('should not change currentWorld when applied then reversed', function () {
			var current = {
                pancakeStack: currentWorld.pancakeStack.slice(),
                moveCount: moveCount,
                numberFlip: numberFlip
            };
			flipOperation.apply(currentWorld);
			flipOperation.reverse(currentWorld);
			expect(currentWorld).toEqual(current);
		});
        
        it('should not change currentWorld when reversed then applied', function () {
			var current = {
                pancakeStack: currentWorld.pancakeStack.slice(),
                moveCount: moveCount,
                numberFlip: number
            };
			flipOperation.reverse(currentWorld);
			flipOperation.apply(currentWorld);
			expect(currentWorld).toEqual(current);
		});
	});
})();