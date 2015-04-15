(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('color', color);
    
    function color() {
        var colorsNames = ['black', 'blue', 'cyan', 'darkGray', 'gray', 'green', 'lightGray', 'magenta', 'orange', 'pink', 'red', 'yellow'];
        var colorsRGB = [[0, 0, 0], [0, 0, 255], [0, 255, 255], [64, 64, 64], [128, 128, 128], [0, 255, 0], [192, 192, 192], [255, 0, 255], [255, 200, 0], [255, 175, 175], [255, 0, 0], [255, 255, 0]];
            
        var service = {
            getColorsNames: getColorsNames,
            nameToRGB: nameToRGB
        }
        return service;
        
        function getColorsNames() {
            return colorsNames.slice(0);
        }
        
        function nameToRGB(name) {
            var index = colorsNames.indexOf(name);
            return (index !== -1) ? colorsRGB[index].slice(0) : null;
        }
    }
})();