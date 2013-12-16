// for assembling color palette from array of raw rgb data from images
// tolerance is used to specify how different your resulting color palette can be. Higher value means less results with higher contrast.
exports.assembleColorPalette = function (colorArray, tolerance) {
  tolerance = tolerance || 255;
  var distinctHues = [colorArray[0]]; // because it has to have something to compare to initially. Probably a better way to handle this.

  for (var i = 1; i < colorArray.length; i++) {
    var distinct = true;
    for (var j = 0; j < distinctHues.length; j++) {
      // probably a better way to do this one too:
      var contrast = (Math.abs(colorArray[i][0] - distinctHues[j][0])) + (Math.abs(colorArray[i][1] - distinctHues[j][1])) + (Math.abs(colorArray[i][2] - distinctHues[j][2]));
      if(contrast < tolerance) {
        distinct = false;
      }
    }
    if(distinct){
      distinctHues.push(colorArray[i]);
    }
  }
  if (distinctHues.length > 5){
    distinctHues = exports.assembleColorPalette(distinctHues, tolerance*1.05);
  } else if (distinctHues.length < 5) {
    distinctHues = exports.assembleColorPalette(colorArray, tolerance*0.95);
  } else {
    console.log('Identified distinct hues:', distinctHues);
    return distinctHues;
  }
};

exports.rgbToHex = function (rgb) {
  rgb = rgb.split(',');
  var r = parseInt(rgb[0].split('(')[1]);
  var g = parseInt(rgb[1]);
  var b = parseInt(rgb[2].split(')')[0]);

  return '#' + ('000000' + ((r << 16) | (g << 8) | b).toString(16)).slice(-6);
};

exports.hexToRGB = function (hex) {
  var rgb = [];

  if( hex.length === 7 || hex.length === 4){
    hex = hex.slice(1);
  }
  if(hex.length === 3){
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  }
  rgb.push(parseInt(hex[0]+hex[1], 16));
  rgb.push(parseInt(hex[2]+hex[3], 16));
  rgb.push(parseInt(hex[4]+hex[5], 16));

  return rgb;
};