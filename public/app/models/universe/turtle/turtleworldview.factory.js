(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('TurtleWorldView', TurtleWorldView);

  TurtleWorldView.$inject = [];

  function TurtleWorldView() {

    var ctx, canvasWidth, canvasHeight, ratio;
    
    var service = {
      draw: draw
    };

    function initUtils(canvas, turtleWorld) {
      ctx = canvas.getContext('2d');
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      ratio = Math.min(canvas.width / turtleWorld.width, canvas.height / turtleWorld.height);
    }

    function draw(canvas, turtleWorld) {
      var turtleID, turtle;

      initUtils(canvas, turtleWorld);
      
      turtleWorld.shapes.forEach(drawShape);
      turtleWorld.sizeHints.forEach(drawSizeHint);
      
      for (turtleID in turtleWorld.entities) {
        if (turtleWorld.entities.hasOwnProperty(turtleID)) {
          turtle = turtleWorld.entities[turtleID];
          drawTurtle(turtle);
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
      
    }
    
    function drawTurtle(turtle) {
      var imageObj = new Image();

      imageObj.onload = function () {
        ctx.save();
        ctx.translate(turtle.x, turtle.y);

        // now move across and down half the 
        // width and height of the image (which is 32 x 32)
        ctx.translate(16, 16);

        // rotate around this point
        ctx.rotate(turtle.heading);

        // then draw the image back and up
        ctx.drawImage(imageObj, -16, -16);
        ctx.restore();
      };
      imageObj.src = '/assets/images/world_turtle.png';
    }
    
    function getColorToRGBA(color) {
      return 'rgba(' + color.join(',') + ')';
    }
    
    return service;
  }
}());