(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('TurtleWorldView', TurtleWorldView);

  TurtleWorldView.$inject = [];

  function TurtleWorldView() {

    var ctx, canvasWidth, canvasHeight, turtleImg;

    turtleImg = new Image();
    turtleImg.src = '/assets/images/world_turtle.png';
    
    var service = {
      draw: draw
    };

    function initUtils(canvas, turtleWorld) {
      ctx = canvas.getContext('2d');
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
    }

    function draw(canvas, turtleWorld) {
      var turtleID, turtle;

      initUtils(canvas, turtleWorld);
      
      turtleWorld.shapes.forEach(drawShape);
      turtleWorld.sizeHints.forEach(drawSizeHint);
      
      for (turtleID in turtleWorld.entities) {
        if (turtleWorld.entities.hasOwnProperty(turtleID)) {
          turtle = turtleWorld.entities[turtleID];
          if(turtle.visible) {
            drawTurtle(turtle);
          }
        }
      }
    }
    
    function drawShape(shape) {
      switch (shape.type) {
      case 'line':
        drawLine(shape);
        break;
      case 'circle':
        drawCircle(shape);
        break;
      default:
      }
    }
    
    function drawLine(line) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = getColorToRGBA(line.color);
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
      ctx.closePath();
    }
    
    function drawCircle(circle) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = getColorToRGBA(circle.color);
      ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.closePath();
    }
    
    function drawSizeHint(sizeHint) {
      var middleX, middleY, hyp, theta, offset;
      
      // draw line
      sizeHint.color = [255, 165, 0, 255]; // #E69400
      drawLine(sizeHint);
      
      // add text
      middleX = (sizeHint.x1 + sizeHint.x2) / 2;
      middleY = (sizeHint.y1 + sizeHint.y2) / 2;
      hyp = Math.sqrt((sizeHint.x1 - sizeHint.x2) * (sizeHint.x1 - sizeHint.x2) + (sizeHint.y1 - sizeHint.y2) * (sizeHint.y1 - sizeHint.y2));
		  theta = Math.acos((sizeHint.y2 - sizeHint.y1) / hyp) - Math.PI / 2;
        
      offset = ctx.measureText(sizeHint.text).width / 2;
      
      ctx.save();
      ctx.translate(middleX, middleY);
      ctx.rotate(theta);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#E69400';
      ctx.textBaseline = 'middle';
      ctx.fillText(sizeHint.text, -offset, 0);
      ctx.restore();
    }
    
    function drawTurtle(turtle) {
      ctx.save();
      ctx.translate(turtle.x, turtle.y);

      // rotate around this point
      ctx.rotate(degreeToRadian(turtle.direction));

      // then draw the image back and up
      ctx.drawImage(turtleImg, -16, -16);
      ctx.restore();
    }
    
    function degreeToRadian(angle) {
      return angle * Math.PI / 180;
    }
    
    function getColorToRGBA(color) {
      return 'rgba(' + color.join(',') + ')';
    }
    
    return service;
  }
}());