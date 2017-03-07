/*jshint esversion: 6 */

L.RegularGridCluster.include( {
  _scaleOperations: {
    size: function (value, min, max, noInts, thresholds, style) {
      var diff = max - min;
      let interval = noInts - 1;
      if (value < max) {
        interval = Math.floor(((value - min)/diff) * noInts);
      }
      return style[interval];
    },

    quantile: function (value, min, max, noInts, thresholds, style) {
      let interval = 0;
      for (var ti in thresholds) {
        if (value > thresholds[ti]) {
          interval = (parseInt(ti) + 1);
        }
      }
      return style[interval];
    },

    continuous: function (value, min, max, noInts, thresholds, style) {
      let interval = 0;

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
        styleValue = this._colorMix(upperValue, bottomValue, ratioDif);
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

  _elmInsideOperations: {
    square: function (ex, ey, cell) {
      var x1 = cell.x, x2 = cell.x + cell.w, y1 = cell.y, y2 = cell.y + cell.h;
      if (ex > x1) {
        if (ey > y1) {
          if (ex < x2) {
            if (ey < y2) {
              return true;
            }
          }
        }
      }
      return false;
    },
    hexagon: function (ex, ey, cell) {
      var x1 = cell.x, x2 = cell.x + cell.w, y1 = cell.y, y2 = cell.y + cell.h;
      if (ex > x1) {
        if (ey > y1) {
          if (ex < x2) {
            if (ey < y2) {
              var yh1 = y1 + cell.h * 1/4, yh2 = y1 + cell.h * 3/4;
              if (ey > yh1 && ey < yh2) {
                return true;
              } else {
                var tx = ex - x1, ty = ey - y1;
                if (ty > (cell.h/4) * 3) {ty = cell.h - ty;}
                if (tx > cell.w/2) {tx = cell.w - tx;}
                return ty/(cell.h/4) + tx/(cell.w/2) > 1;
              }
            }
          }
        }
      }
      return false;
    }
  },

  _buildPathOperations: {
    square: function (c) {
      return [[c.y, c.x], [c.y, c.x + c.w], [c.y + c.h, c.x + c.w], [c.y + c.h, c.x], [c.y, c.x]];
    },
    hexagon: function (c) {
      return [
        [c.y + c.h/4, c.x],
        [c.y, c.x + c.w/2],
        [c.y + c.h/4, c.x + c.w],
        [c.y + 3 * (c.h/4), c.x + c.w],
        [c.y + c.h, c.x + c.w/2],
        [c.y + 3 * (c.h/4), c.x],
        [c.y + c.h/4, c.x]
      ];
    }
  }
});
