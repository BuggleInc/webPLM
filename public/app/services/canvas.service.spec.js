(function(){
	'use strict';

	describe('canvas', function() {
		var _canvas;

		var world;
		var ctx;
		var canvasElt;
		var canvasWidth;
		var canvasHeight;

		beforeEach(module('PLMApp'));

		beforeEach(inject(function(canvas) {
			_canvas = canvas;
		}));

		beforeEach(function () {
			world = {
				draw: function () {}
			};

			ctx = {
				clearRect: function (xLeft, yTop, xRight, yLeft) {
					return 0;
				}
			};
			
			canvasElt = {
				getContext: function (context) {
					return ctx;
				}
			};

			canvasWidth = getRandomInt(999);
			canvasHeight = getRandomInt(999);
			_canvas.init(canvasElt, canvasWidth, canvasHeight);
		});

		it('init should initialize correctly the service', function () {
			var actualCanvasElt = _canvas.getCanvasElt();
			var actualContext = _canvas.getContext();
			
			expect(actualCanvasElt).toEqual(canvasElt);
			expect(actualContext).toEqual(ctx);
			expect(actualCanvasElt.width).toEqual(canvasWidth);
			expect(actualCanvasElt.height).toEqual(canvasHeight);
		});

		it('setWorld should replace canvas\'s current world by the provided one', function () {
			var actualCurrentWorld;

			_canvas.setWorld(world);
			actualCurrentWorld = _canvas.getWorld();
			expect(actualCurrentWorld).toEqual(world);
		});

		it('update should call the current world\'s draw method', function () {
			var actualDrawCall;
			var spyOnDraw;

			spyOnDraw = spyOn(world, 'draw');
			_canvas.setWorld(world);
			_canvas.update();
			actualDrawCall = spyOnDraw.calls.any();
			expect(actualDrawCall).toBe(true);
		});

	});
})();