L.RegularGridCluster.include( {
  _math_max (arr) {
    return Math.max(...arr);
  },

  _math_min (arr) {
    return Math.min(...arr);
  },

  _math_mode (arr) {
    if(arr.length === 0) {return null;}
    var modeMap = {};
    var maxEl = arr[0], maxCount = 1;

    for(var i = 0; i < arr.length; i++){
      var el = arr[i];
      if (el) {
        if(modeMap[el] === null){
          modeMap[el] = 1;
        }else{
          modeMap[el]++;
        }
        if (modeMap[el] > maxCount) {
          maxEl = el;
          maxCount = modeMap[el];
        }
        // extendable to solve ties
      }
    }
    return maxEl;
  },

  _math_mean (arr) {
    return arr.reduce( ( a, b ) => a + b, 0 ) / arr.length;
  },

  _math_sum (arr) {
    return arr.reduce((a, b) => a + b, 0);
  },

  _math_median (arr) {
    arr.sort(function(a,b) {return a - b;} );
    var half = Math.floor(arr.length/2);
    
    if(arr.length % 2) {
      return arr[half];
    } else {
      return (arr[half-1] + arr[half]) / 2.0;
    }
  },
});
