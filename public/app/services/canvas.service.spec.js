(function(){
	'use strict';

	describe('canvas', function() {
		var _canvas;

		var world;
		var ctx;
		var canvasElt;
		var canvasWidth;
		var canvasHeight;
		var draw;

		beforeEach(module('PLMApp'));

		beforeEach(inject(function(canvas) {
			_canvas = canvas;
		}));

		beforeEach(function () {
			world = {};

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

			draw = {
				fnctDraw: function () {} // Need to nest this function into an object to spy it
			};

			canvasWidth = getRandomInt(999);
			canvasHeight = getRandomInt(999);
		});

		it('init should initialize correctly the service', function () {
			var actualCanvasElt;
			var actualContext;
			var actualDraw;

			_canvas.init(canvasElt, canvasWidth, canvasHeight, draw.fnctDraw);
			actualCanvasElt = _canvas.getCanvasElt();
			actualContext = _canvas.getContext();
			actualDraw = _canvas.getDraw();

			expect(actualCanvasElt).toEqual(canvasElt);
			expect(actualContext).toEqual(ctx);
			expect(actualCanvasElt.width).toEqual(Math.min(canvasWidth, 400));
			expect(actualCanvasElt.height).toEqual(Math.min(canvasHeight, 400));
			expect(actualDraw).toEqual(draw.fnctDraw);
		});

		it('setWorld should replace canvas\'s current world by the provided one', function () {
			var actualCurrentWorld;

			_canvas.init(canvasElt, canvasWidth, canvasHeight, draw.fnctDraw);

			_canvas.setWorld(world);
			actualCurrentWorld = _canvas.getWorld();
			expect(actualCurrentWorld).toEqual(world);
		});

		it('update should call the provided draw method', function () {
			var actualDrawCall;
			var spyOnDraw;

			spyOnDraw = spyOn(draw, 'fnctDraw');

			_canvas.init(canvasElt, canvasWidth, canvasHeight, draw.fnctDraw);

			_canvas.setWorld(world);
			_canvas.update();
			actualDrawCall = spyOnDraw.calls.any();
			expect(actualDrawCall).toBe(true);
		});

	});
})();