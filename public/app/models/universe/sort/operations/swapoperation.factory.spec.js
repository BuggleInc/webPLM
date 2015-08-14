(function(){
	'use strict';

	describe('SwapOperation', function() {
        var _SwapOperation;
        
        var currentWorld;
        var swapOperation;
        var destination;
        var source;
        var values;
        
        beforeEach(module('PLMApp'));
        
        beforeEach(inject(function(SwapOperation) {
			_SwapOperation = SwapOperation;
		}));
        
        beforeEach(function() {
            var i;
            var nbValue;
            var memory;
            
            values = [];
            nbValue = getRandomInt(100) + 2;
            for(i = 0; i < nbValue; i++) {
                values.push(getRandomInt(100));
            }
            
            memory = [];
            memory.push(values.slice());
            memory.push(values.slice());
            
            destination = getRandomInt(nbValue);
            source = getRandomInt(nbValue);
            
            currentWorld = {
                values: values,
                memory: memory
            };
            
            var dataOperation = {
                destination: destination,
                source: source
			};
        
            swapOperation = new _SwapOperation(dataOperation);
        });
        
        it('should be initialized correctly by its constructor', function () {
            expect(swapOperation.dest).toEqual(destination);
			expect(swapOperation.src).toEqual(source);
		});

		it('should swap values[src] with values[dest] and add values to memory when applied', function () {
            var memLen = currentWorld.memory.length;
            var tmp1 = currentWorld.values[destination];
            var tmp2 = currentWorld.values[source];
			swapOperation.apply(currentWorld);
            expect(currentWorld.values[destination]).toEqual(tmp2);
			expect(currentWorld.values[source]).toEqual(tmp1);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.values);
            expect(currentWorld.memory.length).toEqual(memLen+1);
		});

		it('should swap values[src] with values[dest] and clean memory when reversed', function () {
            var tmp = currentWorld.values[source];
			currentWorld.values[source] = currentWorld.values[destination];
			currentWorld.values[destination] = tmp ;
            var memLen = currentWorld.memory.length;
            var tmp1 = currentWorld.values[destination];
            var tmp2 = currentWorld.values[source];
			swapOperation.reverse(currentWorld);
            expect(currentWorld.values[destination]).toEqual(tmp2);
			expect(currentWorld.values[source]).toEqual(tmp1);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.values);
            expect(currentWorld.memory.length).toEqual(memLen-1);
		});
        
        it('should not change currentWorld when applied then reversed', function () {
			var current = {
                values: currentWorld.values.slice(),
                memory: currentWorld.memory.map(function(t){return t.slice()})
            };
			swapOperation.apply(currentWorld);
			swapOperation.reverse(currentWorld);
			expect(currentWorld).toEqual(current);
		});
        
        it('should not change currentWorld when reversed then applied', function () {
			var current = {
                values: currentWorld.values.slice(),
                memory: currentWorld.memory.map(function(t){return t.slice()})
            };
			swapOperation.reverse(currentWorld);
			swapOperation.apply(currentWorld);
			expect(currentWorld).toEqual(current);
		});
	});
})();