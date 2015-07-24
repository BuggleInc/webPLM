(function(){
	'use strict';

	describe('DutchFlagSwap', function() {
        var _DutchFlagSwap;
        
        var currentWorld;
        var dutchFlagSwap;
        var destination;
        var source;
        var values;
        var moveCount
        
        beforeEach(module('PLMApp'));
        
        beforeEach(inject(function(DutchFlagSwap) {
			_DutchFlagSwap = DutchFlagSwap;
		}));
        
        beforeEach(function() {
            var i;
            var nbValue;
            var memory;
            
            values = [];
            nbValue = getRandomInt(100) + 2;
            for(i = 0; i < nbValue; i++) {
                values.push(getRandomInt(3));
            }
            
            memory = [];
            memory.push(values.slice());
            memory.push(values.slice());
            
            destination = getRandomInt(nbValue);
            source = getRandomInt(nbValue);
            moveCount = getRandomInt(42);
            
            currentWorld = {
                content: values,
                memory: memory,
                moveCount: moveCount
            };
            
            var dataOperation = {
                destination: destination,
                source: source
			};
        
            dutchFlagSwap = new _DutchFlagSwap(dataOperation);
        });
        
        it('should be initialized correctly by its constructor', function () {
            expect(dutchFlagSwap.dest).toEqual(destination);
			expect(dutchFlagSwap.src).toEqual(source);
		});

		it('should swap content[src] with content[dest] and add values to memory and increment moveCount when applied', function () {
            var memLen = currentWorld.memory.length;
            var tmp1 = currentWorld.content[destination];
            var tmp2 = currentWorld.content[source];
			dutchFlagSwap.apply(currentWorld);
            expect(currentWorld.content[destination]).toEqual(tmp2);
			expect(currentWorld.content[source]).toEqual(tmp1);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.content);
            expect(currentWorld.memory.length).toEqual(memLen+1);
            expect(currentWorld.moveCount).toEqual(moveCount+1);
		});

		it('should swap content[src] with content[dest] and clean memory and decrement moveCount when reversed', function () {
            var tmp = currentWorld.content[source];
			currentWorld.content[source] = currentWorld.content[destination];
			currentWorld.content[destination] = tmp ;
            var memLen = currentWorld.memory.length;
            var tmp1 = currentWorld.content[destination];
            var tmp2 = currentWorld.content[source];
			dutchFlagSwap.reverse(currentWorld);
            expect(currentWorld.content[destination]).toEqual(tmp2);
			expect(currentWorld.content[source]).toEqual(tmp1);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.content);
            expect(currentWorld.memory.length).toEqual(memLen-1);
            expect(currentWorld.moveCount).toEqual(moveCount-1);
		});
        
        it('should not change currentWorld when applied then reversed', function () {
			var current = {
                content: currentWorld.content.slice(),
                memory: currentWorld.memory.map(function(t){return t.slice()}),
                moveCount: moveCount
            };
			dutchFlagSwap.apply(currentWorld);
			dutchFlagSwap.reverse(currentWorld);
			expect(currentWorld).toEqual(current);
		});
        
        it('should not change currentWorld when reversed then applied', function () {
			var current = {
                content: currentWorld.content.slice(),
                memory: currentWorld.memory.map(function(t){return t.slice()}),
                moveCount: moveCount
            };
			dutchFlagSwap.reverse(currentWorld);
			dutchFlagSwap.apply(currentWorld);
			expect(currentWorld).toEqual(current);
		});
	});
})();