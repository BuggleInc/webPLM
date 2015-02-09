beforeEach(function () {
  jasmine.addMatchers({
    toBePlaying: function () {
      return {
        compare: function (actual, expected) {
          var player = actual;

          return {
            pass: player.currentlyPlayingSong === expected && player.isPlaying
          }
        }
      };
    }
  });
});

function once(fn) {
    var returnValue, called = false;
    return function () {
        if (!called) {
            called = true;
            returnValue = fn.apply(this, arguments);
        }
        return returnValue;
    };
}

function getRandomString(range) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for(var i=0; i<5; i++) {
    text += possible.charAt(parseInt(Math.random() * possible.length));
  }

  return text;
}

function getRandomInt(range) {
  return parseInt(Math.random()*range);
}

function getRandomColor() {
  return [getRandomInt(255), getRandomInt(255), getRandomInt(255), getRandomInt(255)];
}

function getRandomBoolean() {
  if(Math.random()<0.5) {
    return true;
  }
  return false;
}

function getRandomDirection() {
  return getRandomInt(4);
}