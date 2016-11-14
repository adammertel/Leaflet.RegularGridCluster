  // MATH FUNCTIONS

L.RegularGridCluster.include( {
  _math_max: function(arr) {
    if (arr.length){
      return  Math.max.apply(
        null, arr.map(
          function(o){
            if (o){return o;}
            else{return 0;}
          }
        )
      );
    } else {
      return undefined;
    }
  },

  _math_min: function(arr) {
    if (arr.length){
      return Math.min.apply(
        null, arr.map(
          function(o){
            if (o){return o;}
            else{return 99999;}
          }
        )
      );
    } else {
      return undefined;
    }
  },

  _math_mode: function(arr) {
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

  _math_mean: function(arr) {
    var state = arr.reduce(
      function (state,a) {
        if (a) {
          state.sum+=a;
          state.count+=1;
        }
        return state;
      },{sum:0,count:0}
    );
    return state.sum / state.count;
  },

  _math_sum: function(arr) {
    if(arr.length === 0) {return 0;}
    return arr.reduce(
      function (a, b) {
        if (b) {
          return a + b;
        } else {
          return 0;
        }
      }, 0
    );
  },

  _math_median: function (arr) {
    arr.sort(function(a,b) {return a - b;} );
    var half = Math.floor(arr.length/2);
    if(arr.length % 2) {
      return arr[half];
    } else {
      return (arr[half-1] + arr[half]) / 2.0;
    }
  },
});
