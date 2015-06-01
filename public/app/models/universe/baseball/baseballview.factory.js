(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('BaseballView', BaseballView);

	function BaseballView()
	{
		var ctx;
		var canvasWidth;
		var canvasHeight;
		
		var INVADER_SPRITE_SIZE = 11;
		var INVADER_SPRITE = 
			[
				[ 0,0,0,0,0,0,0,0,0,0,0 ],
				[ 0,0,1,0,0,0,0,0,1,0,0 ],
				[ 0,0,0,1,0,0,0,1,0,0,0 ],
				[ 0,0,1,1,1,1,1,1,1,0,0 ],
				[ 0,1,1,0,1,1,1,0,1,1,0 ],
				[ 1,1,1,1,1,1,1,1,1,1,1 ],
				[ 1,0,1,1,1,1,1,1,1,0,1 ],
				[ 1,0,1,0,0,0,0,0,1,0,1 ],
				[ 0,0,0,1,1,0,1,1,0,0,0 ],
				[ 0,0,0,0,0,0,0,0,0,0,0 ],
				[ 0,0,0,0,0,0,0,0,0,0,0 ],
			];

		var service = {
			draw: draw,
		};

		return service;

		function initUtils(canvas, baseballWorld)
		{
			ctx = canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}

		function draw(canvas, baseballWorld)
		{
			//stock some points
			var points = [];

			initUtils(canvas, baseballWorld);
			ctx.beginPath();
			drawField(baseballWorld, points);
			drawText(baseballWorld);
			drawArrows(baseballWorld, points);
			ctx.closePath();
		}

		//convert degrees in radians
		function toRad(angle)
		{
			return angle * (Math.PI / 180);
		}

		//draws the amount of moves
		function drawText(baseballWorld)
		{
			ctx.beginPath();
			ctx.fillStyle = '#FFFFFF';
			ctx.font = '15px sans-serif';
			
			if(baseballWorld.moveCount <= 1)
				ctx.fillText(baseballWorld.moveCount+' Move',5,25);
			else
				ctx.fillText(baseballWorld.moveCount+ ' Moves',5,25);
			
			ctx.closePath();
		}

		//draws arrows heads
		function drawArrowHead(fromx,fromy, tox, toy)
		{
			//head length
			var head = 10;

			//angle to place correctly the head
			var angle = Math.atan2(toy-(canvasHeight/2),tox-(canvasWidth/2));
			ctx.moveTo(tox, toy);
			ctx.lineTo(tox-head*Math.cos(angle-Math.PI/6),toy-head*Math.sin(angle-Math.PI/6));
			ctx.moveTo(tox,toy);
			ctx.lineTo(tox-head*Math.cos(angle+Math.PI/6),toy-head*Math.sin(angle+Math.PI/6));
			ctx.moveTo(fromx,fromy);

			//add a round effect
			ctx.lineCap = 'round';
			ctx.stroke();
		}

		//draws the field, bases, positions, and buggles
		function drawField(baseballWorld, points)
		{
			var nb = baseballWorld.baseAmount;
			var width = canvasWidth / 2;
			var radius = canvasHeight / 2;

			//Firstly, we need a circle where take place the left top corner of our rectangles
			var dif = (radius-75) + (nb * 3);

			//we need a circle divided by the double number of bases
			var angle = toRad(360 / (nb * 2));

			//x and y of our first corner of rectangles
			var firstX = width - 45;
			var firstY = radius + dif - 10;

			//x and y of our second corner of rectangles
			var secondX = width - 60;
			var secondY = canvasHeight - 11;

			//these variables allows us to stock some values
			var Fmemo = [], Smemo = [];

			//x and y of our center
			var XCenter = width, YCenter = radius;

			//these variables are used to found points(corners) on the circle
			var dX1, dY1, dX2, dY2, dX3, dY3, dX4, dY4;

			//these variables are used to found the 4th corner(to draw a parallelogram)
			var unknownX, unknownY;

			//x and y of the 4th corner
			var x, y;

			//these variables are used to compute some distances between two points
			var ax, ay, bx, by, cx, cy, distance, lambda, next, arrLambda, arrDistance;

			//x and y of the buggle
			var buggleX, buggleY;

			//draws the pitch
			ctx.beginPath();
			ctx.fillStyle = '#006600';
			ctx.fillRect(0,0,canvasWidth,canvasHeight);
			ctx.closePath();

			//draws the ground
			ctx.beginPath();
			ctx.fillStyle = '#663300';
			ctx.arc(width, radius, radius, 2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();

			//draws the border ground
			ctx.beginPath();
			ctx.strokeStyle = 'rgb(0,0,0)';
			ctx.arc(width, radius, radius,2 * Math.PI, false);
			ctx.stroke();
			ctx.closePath();

			for(var i=0; i<nb*2; i++)
			{
				//draws bases
				dX1 = firstX - XCenter;
				dY1 = firstY - YCenter;
				dX3 = secondX - XCenter;
				dY3 = secondY - YCenter;
				dX2 = dX1 * Math.cos(angle) - dY1 * Math.sin(angle);
				dY2 = dX1 * Math.sin(angle) + dY1 * Math.cos(angle);
				dX4 = dX3 * Math.cos(angle) - dY3 * Math.sin(angle);
				dY4 = dX3 * Math.sin(angle) + dY3 * Math.cos(angle);

				ctx.beginPath();
				ctx.moveTo(secondX,secondY);
				Smemo[0] = secondX;
				Smemo[1] = secondY;
				secondX = dX4 + XCenter;
				secondY = dY4 + YCenter;
				ctx.lineTo(secondX, secondY);
				Fmemo[0] = firstX;
				Fmemo[1] = firstY;
				firstX = dX2 + XCenter;
				firstY = dY2 + YCenter;
				ctx.lineTo(firstX, firstY);				
				
				//found the middle of two diagonals
				unknownX = (Smemo[0] + firstX) / 2;
				unknownY = (Smemo[1] + firstY) / 2;

				//found the 4th corner
				x = 2 * unknownX - secondX;
				y = 2 * unknownY - secondY;
				ctx.lineTo(x, y);
				ctx.lineTo(Smemo[0], Smemo[1]);

				//Chooses the bases color
				ctx.fillStyle = baseballWorld.colors[i/2];

				//displays them only if it's a base
				if(i % 2 === 0)
					ctx.fill();
				
				ctx.closePath();

				//draws the positions
				if(i % 2 === 0)
				{
					//found the middle of the parallelogram
					unknownX = (Smemo[0] + x) / 2;
					unknownY = (Smemo[1] + y) / 2;
					unknownX = (firstX + secondX) / 2;
					unknownY = (firstY + secondY) / 2;
					ax = (Smemo[0] + x) / 2;
					ay = (Smemo[1] + y) / 2;
					bx = (firstX + secondX) / 2;
					by = (firstY + secondY) / 2;

					//locate the center of the positions
					distance = Math.sqrt(Math.pow(bx-ax,2)+Math.pow(by-ay,2)) / (baseballWorld.posAmount*2);
					lambda = distance / (Math.sqrt(Math.pow(bx-ax,2)+Math.pow(by-ay,2)));
					arrDistance = Math.sqrt(Math.pow(ax-x,2)+Math.pow(ay-y,2));
					arrLambda = arrDistance / (Math.sqrt(Math.pow(ax-x,2)+Math.pow(ay-y,2)));
					cx = ax + (lambda * (bx - ax));
					cy = ay + (lambda * (by - ay));
					next = distance;	

					for(var j=0;j<baseballWorld.posAmount;j++)
					{
						//draws the positions
						ctx.beginPath();
						ctx.fillStyle = '#FFFFFF';
						ctx.arc(cx, cy, 39-(5*baseballWorld.posAmount)-(1.65*(nb-2)), 2 * Math.PI, false);
						ctx.fill();
						ctx.closePath();

						//draws the border position in red if the buggle isnt correctly placed
						ctx.beginPath();
						if(baseballWorld.field[(i/2)*baseballWorld.posAmount+j] != i/2 && baseballWorld.field[(i/2)*baseballWorld.posAmount+j]  != -1)
						{
							ctx.strokeStyle = '#FF0000';
							ctx.lineWidth = 3;
						}
						else
						{
							ctx.strokeStyle = '#000000';
							ctx.lineWidth = 1;
						}

						ctx.arc(cx, cy, 39-(5*baseballWorld.posAmount)-(1.65*(nb-2)), 2 * Math.PI, false);
						ctx.stroke();
						ctx.closePath();

						//to avoid bad lineWidth
						ctx.lineWidth = 1;

						//draws buggles	
						if(baseballWorld.field[(i/2)*baseballWorld.posAmount+j] != -1)
						{
							
							var dx, dy;
							var pixW = 5.3-(0.6*baseballWorld.posAmount)-(2.5*(nb)) / INVADER_SPRITE_SIZE;
							var pixY = 5.3-(0.6*baseballWorld.posAmount)-(2.5*(nb)) / INVADER_SPRITE_SIZE;

							ctx.beginPath();
							ctx.fillStyle = baseballWorld.colors[baseballWorld.field[(i/2)*baseballWorld.posAmount+j]];
							buggleX = cx - 20 + (1.2*(nb-4)) + (3 * baseballWorld.posAmount-2);
							buggleY = cy - 19 + (1.1*(nb-4)) + (3 * baseballWorld.posAmount-2);
							for(dy=0; dy<INVADER_SPRITE_SIZE; dy++) {
								for(dx=0; dx<INVADER_SPRITE_SIZE; dx++) {
									if(INVADER_SPRITE[dy][dx] === 1) {
										ctx.fillRect(buggleX+dx*pixW, buggleY+dy*pixY, pixW, pixY);
									}
								}
							}
							ctx.closePath();
						}

						//x and y of the first point of the arrow
						var arrcx = cx + (arrLambda * (x - ax));
						var arrcy = cy + (arrLambda * (y - ay));
						points.push([(i/2)*baseballWorld.posAmount+j,arrcx, arrcy]);
						ctx.lineWidth = 1;
						next += distance * 2;
						lambda = next / (Math.sqrt(Math.pow(bx-ax,2)+Math.pow(by-ay,2)));
						cx = ax + (lambda * (bx - ax));
						cy = ay + (lambda * (by - ay));
					}
				}
			}
		}

		//draws the arrows body
		function drawArrows(baseballWorld, points)
		{
			var nb = baseballWorld.baseAmount;
			var width = canvasWidth / 2;
			var radius = canvasHeight / 2;

			//index in order to choose the color in the array baseballworld.colors
			var indexColor = baseballWorld.oldMove;

			for(var i=0; i<baseballWorld.posAmount*nb;i++)
			{
				//draws arrows
				if(i === baseballWorld.move)
				{
					//dotted arrows
					ctx.setLineDash([10, 8]);
					ctx.beginPath();
					
					if(!baseballWorld.isReverse)
						ctx.strokeStyle = baseballWorld.colors[baseballWorld.field[indexColor]];
					else
						ctx.strokeStyle = baseballWorld.colors[baseballWorld.field[baseballWorld.oldBase*baseballWorld.posAmount+baseballWorld.oldPosition]];

					ctx.moveTo(points[baseballWorld.holeBase*baseballWorld.posAmount + baseballWorld.holePos][1],points[baseballWorld.holeBase*baseballWorld.posAmount + baseballWorld.holePos][2]);
					ctx.quadraticCurveTo(width, radius, points[baseballWorld.oldBase*baseballWorld.posAmount+baseballWorld.oldPosition][1], points[baseballWorld.oldBase*baseballWorld.posAmount+baseballWorld.oldPosition][2]);
					ctx.lineWidth = 5;
					ctx.stroke();
					drawArrowHead(points[baseballWorld.holeBase*baseballWorld.posAmount + baseballWorld.holePos][1], points[baseballWorld.holeBase*baseballWorld.posAmount + baseballWorld.holePos][2], points[baseballWorld.oldBase*baseballWorld.posAmount+baseballWorld.oldPosition][1], points[baseballWorld.oldBase*baseballWorld.posAmount+baseballWorld.oldPosition][2]);
					ctx.lineWidth = 1;
					//stop to draw dotted lines
					ctx.setLineDash([]);
				}
			}
		}
	}
})();