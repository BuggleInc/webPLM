(function(){
	'use strict';

	describe('SetValOperation', function() {
        var _SetValOperation;
        
        var currentWorld;
        var setValOperation;
        var value;
        var position;
        var oldValue;
        var values;
        
        beforeEach(module('PLMApp'));
        
        beforeEach(inject(function(SetValOperation) {
			_SetValOperation = SetValOperation;
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
            
            value = getRandomInt(100);
            position = getRandomInt(nbValue);
            oldValue = values[position];
            
            currentWorld = {
                values: values,
                memory: memory
            };
            
            var dataOperation = {
                value: value,
                position: position,
                oldValue: oldValue
			};
        
            setValOperation = new _SetValOperation(dataOperation);
        });
        
        it('should be initialized correctly by its constructor', function () {
            expect(setValOperation.value).toEqual(value);
			expect(setValOperation.position).toEqual(position);
            expect(setValOperation.oldValue).toEqual(oldValue);
		});

		it('should replace values[position] by value and add values to memory when applied', function () {
            var memLen = currentWorld.memory.length;
			setValOperation.apply(currentWorld);
			expect(currentWorld.values[position]).toEqual(value);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.values);
            expect(currentWorld.memory.length).toEqual(memLen+1);
		});

		it('should replace values[position] by oldValue and clean memory when reversed', function () {
            var memLen = currentWorld.memory.length;
			setValOperation.reverse(currentWorld);
			expect(currentWorld.values[position]).toEqual(oldValue);
            expect(currentWorld.memory[currentWorld.memory.length-1]).toEqual(currentWorld.values);
            expect(currentWorld.memory.length).toEqual(memLen-1);
		});
        
        it('should not change currentWorld when applied then reversed', function () {
			var current = {
                values: currentWorld.values.slice(),
                memory: currentWorld.memory.map(function(t){return t.slice()})
            };
			setValOperation.apply(currentWorld);
			setValOperation.reverse(currentWorld);
			expect(currentWorld).toEqual(current);
		});
        
        it('should not change currentWorld when reversed then applied', function () {
            currentWorld.values[position] = value;
            currentWorld.memory[currentWorld.memory.length-1][position] = value;
			var current = {
                values: currentWorld.values.slice(),
                memory: currentWorld.memory.map(function(t){return t.slice()})
            }
			setValOperation.reverse(currentWorld);
			setValOperation.apply(currentWorld);
			expect(currentWorld).toEqual(current);
		});
	});
})();