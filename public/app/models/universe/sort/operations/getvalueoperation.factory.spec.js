(function(){
	'use strict';

	describe('GetValueOperation', function() {
        var _GetValueOperation;
        
        var currentWorld;
        var getValueOperation;
        var position;
        var values;
        
        beforeEach(module('PLMApp'));
        
        beforeEach(inject(function(GetValueOperation) {
			_GetValueOperation = GetValueOperation;
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
            memory.push(values);
            memory.push(values);
            
            position = getRandomInt(nbValue);
            
            currentWorld = {
                values: values,
                memory: memory
            };
            
            var dataOperation = {
                position: position
			};
        
            getValueOperation = new _GetValueOperation(dataOperation);
        });
        
        it('should be initialized correctly by its constructor', function () {
			expect(getValueOperation.position).toEqual(position);
		});

		it('should not change values and add values to memory when applied', function () {
            var memLen = currentWorld.memory.length;
			getValueOperation.apply(currentWorld);
			expect(currentWorld.values).toEqual(values);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.values);
            expect(currentWorld.memory.length).toEqual(memLen+1);
		});

		it('should not change values and clean memory when reversed', function () {
            var memLen = currentWorld.memory.length;
			getValueOperation.reverse(currentWorld);
			expect(currentWorld.values).toEqual(values);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.values);
            expect(currentWorld.memory.length).toEqual(memLen-1);
		});
	});
})();