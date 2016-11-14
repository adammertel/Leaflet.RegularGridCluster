L.RegularGridCluster.include( {
  _scaleOperations: {
    size: function (value, min, max, noInts, thresholds, style) {
      var diff = max - min;
      interval = noInts - 1;
      if (value < max) {
        interval = Math.floor(((value - min)/diff) * noInts);
      }
      return style[interval];
    },

    quantile: function (value, min, max, noInts, thresholds, style) {
      interval = 0;
      for (var ti in thresholds) {
        if (value > thresholds[ti]) {
          interval = (parseInt(ti) + 1);
        }
      }
      return style[interval];
    },

    continuous: function (value, min, max, noInts, thresholds, style) {
      interval = 0;

      for (var tj in thresholds) {
        if (value > thresholds[tj]) {
          interval = parseInt(tj) + 1;
        }
      }

      var edgeValues = thresholds.slice(0);
      edgeValues.push(max);
      edgeValues.unshift(min);

      var ratioDif = (value - edgeValues[interval]) / (edgeValues[interval + 1] - edgeValues[interval]);
      var bottomValue = style[interval];
      var upperValue = style[interval + 1];
      var styleValue;

      if (this._isNumber(bottomValue)) {
        styleValue = bottomValue + ratioDif * (upperValue - bottomValue);
      } else {
        styleValue = this._colorMix(bottomValue, upperValue, ratioDif);
      }

      return styleValue;
    }
  },

  _methodOperations: {
    count: function (cell, values) {return cell.elms.length;},
    mean: function (cell, values) {return this._math_mean(values);},
    median: function (cell, values) {return this._math_median(values);},
    mode: function (cell, values) {return this._math_mode(values);},
    max: function (cell, values) {return this._math_max(values);},
    min: function (cell, values) {return this._math_min(values);},
    sum: function (cell, values) {return this._math_sum(values);},
  },

  _cellsInsideOperations: {
    square: function (cell, elements) {
      return this._elmsInsideSquare(cell, elements);
    }
  }
});
