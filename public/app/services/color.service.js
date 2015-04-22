(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('color', color);
    
    function color() {
        var colorsNames = ['white', 'black', 'blue', 'cyan', 'darkGray', 'gray', 'green', 'lightGray', 'magenta', 'orange', 'pink', 'red', 'yellow'];
        var colorsRGB = [[255, 255, 255], [0, 0, 0], [0, 0, 255], [0, 255, 255], [64, 64, 64], [128, 128, 128], [0, 255, 0], [192, 192, 192], [255, 0, 255], [255, 200, 0], [255, 175, 175], [255, 0, 0], [255, 255, 0]];
        var regexRGB = /^(\d+)\/(\d+)\/(\d+)$/;
        
        var service = {
            getColorsNames: getColorsNames,
            nameToRGB: nameToRGB,
            RGBtoName: RGBtoName,
            RGBtoStr: RGBtoStr,
            strToRGB: strToRGB
        }
        return service;
        
        function getColorsNames() {
            return colorsNames.slice(0);
        }
        
        function nameToRGB(name) {
            var index = colorsNames.indexOf(name);
            return (index !== -1) ? colorsRGB[index].slice(0) : null;
        }
        
        function RGBtoName(rgbValue) {
            var i = 0;
            var index = -1;
            while(i < colorsRGB.length && index === -1) {
                if(colorsRGB[i][0] === rgbValue[0] && colorsRGB[i][1] === rgbValue[1] && colorsRGB[i][2] === rgbValue[2]) {
                    index = i;
                }
                i++;
            }
            return (index !== -1) ? colorsNames[index] : null;
        }
        
        function RGBtoStr(rgbValue) {
            var strValue = null;
            if(Array.isArray(rgbValue) && rgbValue.length >= 3) {
                strValue = rgbValue[0] + '/' + rgbValue[1] + '/' + rgbValue[2];
            }
            return strValue;
        }
        
        function strToRGB(strValue) {
            var rgbValue = null;
            if(regexRGB.test(strValue)) {
                rgbValue = [];
                rgbValue.push(parseInt(strValue.replace(regexRGB, '$1')));
                rgbValue.push(parseInt(strValue.replace(regexRGB, '$2')));
                rgbValue.push(parseInt(strValue.replace(regexRGB, '$3')));
                rgbValue.forEach(function(num, pos, tab) {
                    if(num > 255)  tab[pos] = 255;
                    else if(num < 0) tab[pos] = 0;
                });
            }
            return rgbValue;
        }
    }
})();