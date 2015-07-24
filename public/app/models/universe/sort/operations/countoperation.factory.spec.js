(function(){
	'use strict';

	describe('CountOperation', function() {
        var _CountOperation;
        
        var currentWorld;
        var countOperation;
        var read;
        var write;
        var oldRead;
        var oldWrite;
        
        beforeEach(module('PLMApp'));
        
        beforeEach(inject(function(CountOperation) {
			_CountOperation = CountOperation;
		}));
        
        beforeEach(function() {
            
            oldRead = getRandomInt(100);
            oldWrite = getRandomInt(100);
            read = getRandomInt(100);
            write = getRandomInt(100);
            
            currentWorld = {
                readCount: oldRead,
                writeCount: oldWrite
            };
            
            var dataOperation = {
                read: read,
                write: write,
                oldRead: oldRead,
                oldWrite: oldWrite
			};
        
            countOperation = new _CountOperation(dataOperation);
        });
        
        it('should be initialized correctly by its constructor', function () {
			expect(countOperation.read).toEqual(read);
			expect(countOperation.write).toEqual(write);
			expect(countOperation.oldRead).toEqual(oldRead);
            expect(countOperation.oldWrite).toEqual(oldWrite);
		});

		it('should replace readCount by read and WriteCount by write when applied', function () {
			countOperation.apply(currentWorld);
			expect(currentWorld.readCount).toEqual(read);
            expect(currentWorld.writeCount).toEqual(write);
		});

		it('should replace readCount by oldRead and writeCount by oldWrite when reversed', function () {
			countOperation.reverse(currentWorld);
			expect(currentWorld.readCount).toEqual(oldRead);
            expect(currentWorld.writeCount).toEqual(oldWrite);
		});
        
        it('should not change currentWorld when applied then reversed', function () {
			var current = {
                readCount: oldRead,
                writeCount: oldWrite
            };
			countOperation.apply(currentWorld);
			countOperation.reverse(currentWorld);
			expect(currentWorld).toEqual(current);
		});
        
        it('should not change currentWorld when reversed then applied', function () {
			var current = {
                readCount: read,
                writeCount: write
            };
			countOperation.reverse(currentWorld);
			countOperation.apply(currentWorld);
			expect(currentWorld).toEqual(current);
		});
	});
})();