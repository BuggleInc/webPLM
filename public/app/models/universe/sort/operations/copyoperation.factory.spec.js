(function(){
	'use strict';

	describe('CopyOperation', function() {
        var _CopyOperation;
        
        var currentWorld;
        var copyOperation;
        var dest;
        var src;
        var oldValue;
        
        beforeEach(module('PLMApp'));
        
        beforeEach(inject(function(CopyOperation) {
			_CopyOperation = CopyOperation;
		}));
        
        beforeEach(function() {
            var i;
            var nbValue;
            var values;
            var memory;
            
            values = [];
            nbValue = getRandomInt(100) + 2;
            for(i = 0; i < nbValue; i++) {
                values.push(getRandomInt(100));
            }
            
            memory = [];
            memory.push(values.slice());
            memory.push(values.slice());
            
            dest = getRandomInt(nbValue);
            src = getRandomInt(nbValue);
            oldValue = values[dest];
            
            currentWorld = {
                values: values,
                memory: memory
            };
            
            var dataOperation = {
                destination: dest,
                source: src,
                oldValue: oldValue
			};
        
            copyOperation = new _CopyOperation(dataOperation);
        });
        
        it('should be initialized correctly by its constructor', function () {
			expect(copyOperation.dest).toEqual(dest);
			expect(copyOperation.src).toEqual(src);
			expect(copyOperation.oldValue).toEqual(oldValue);
		});

		it('should replace values[dest] by values[src] and add values to memory when applied', function () {
            var memLen = currentWorld.memory.length;
			copyOperation.apply(currentWorld);
			expect(currentWorld.values[dest]).toEqual(currentWorld.values[src]);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.values);
            expect(currentWorld.memory.length).toEqual(memLen+1);
		});

		it('should replace values[dest] by oldValue and clean memory when reversed', function () {
            var memLen = currentWorld.memory.length;
			copyOperation.reverse(currentWorld);
			expect(currentWorld.values[dest]).toEqual(oldValue);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.values);
            expect(currentWorld.memory.length).toEqual(memLen-1);
		});
        
        it('should not change currentWorld when applied then reversed', function () {
			var current = {
                values: currentWorld.values.slice(),
                memory: currentWorld.memory.map(function(t){return t.slice()})
            };
			copyOperation.apply(currentWorld);
			copyOperation.reverse(currentWorld);
			expect(currentWorld).toEqual(current);
		});
        
        it('should not change currentWorld when reversed then applied', function () {
            currentWorld.values[dest] = currentWorld.values[src];
            currentWorld.memory[currentWorld.memory.length-1][dest] = currentWorld.values[src];
			var current = {
                values: currentWorld.values.slice(),
                memory: currentWorld.memory.map(function(t){return t.slice()})
            }
			copyOperation.reverse(currentWorld);
			copyOperation.apply(currentWorld);
			expect(currentWorld).toEqual(current);
		});
	});
})();