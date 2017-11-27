L.RegularGridCluster.include({
  _scaleOperations: {
    size: (cluster, value, min, max, noInts, thresholds, range) => {
      const diff = max - min;
      let interval = noInts - 1;
      if (value < max) {
        interval = Math.floor((value - min) / diff * noInts);
      }
      return range[interval];
    },

    quantile: (cluster, value, min, max, noInts, thresholds, range) => {
      let interval = 0;
      thresholds.map((threshold, ti) => {
        if (value > threshold) {
          interval = parseInt(ti) + 1;
        }
      });
      return range[interval];
    },

    continuous: (cluster, value, min, max, noInts, thresholds, range) => {
      let interval = 0;

      thresholds.map((threshold, ti) => {
        if (value > threshold) {
          interval = parseInt(ti) + 1;
        }
      });

      const edgeValues = thresholds.slice(0);
      edgeValues.push(max);
      edgeValues.unshift(min);

      const ratioDif =
        (value - edgeValues[interval]) /
        (edgeValues[interval + 1] - edgeValues[interval]);
      const bottomValue = range[interval];
      const upperValue = range[interval + 1];

      if (cluster._isNumber(bottomValue)) {
        return bottomValue + ratioDif * (upperValue - bottomValue);
      } else {
        return cluster._colorMix(upperValue, bottomValue, ratioDif);
      }
    }
  },

  _methodOperations: {
    count: (cluster, zone, values) => zone.elms.length,
    mean: (cluster, zone, values) => cluster._math_mean(values),
    median: (cluster, zone, values) => cluster._math_median(values),
    mode: (cluster, zone, values) => cluster._math_mode(values),
    max: (cluster, zone, values) => cluster._math_max(values),
    min: (cluster, zone, values) => cluster._math_min(values),
    sum: (cluster, zone, values) => cluster._math_sum(values)
  },

  _elmInsideOperations: {
    square: (ex, ey, zone) => {
      const x1 = zone.x,
        x2 = zone.x + zone.w,
        y1 = zone.y,
        y2 = zone.y + zone.h;
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
    hexagon: (ex, ey, zone) => {
      const x1 = zone.x,
        x2 = zone.x + zone.w,
        y1 = zone.y,
        y2 = zone.y + zone.h;
      if (ex > x1) {
        if (ey > y1) {
          if (ex < x2) {
            if (ey < y2) {
              const yh1 = y1 + zone.h * 1 / 4,
                yh2 = y1 + zone.h * 3 / 4;
              if (ey > yh1 && ey < yh2) {
                return true;
              } else {
                let tx = ex - x1,
                  ty = ey - y1;
                if (ty > zone.h / 4 * 3) {
                  ty = zone.h - ty;
                }
                if (tx > zone.w / 2) {
                  tx = zone.w - tx;
                }
                return ty / (zone.h / 4) + tx / (zone.w / 2) > 1;
              }
            }
          }
        }
      }
      return false;
    }
  },

  _buildPathOperations: {
    square: c => {
      return [
        [c.y, c.x],
        [c.y, c.x + c.w],
        [c.y + c.h, c.x + c.w],
        [c.y + c.h, c.x],
        [c.y, c.x]
      ];
    },
    hexagon: c => {
      return [
        [c.y + c.h / 4, c.x],
        [c.y, c.x + c.w / 2],
        [c.y + c.h / 4, c.x + c.w],
        [c.y + 3 * (c.h / 4), c.x + c.w],
        [c.y + c.h, c.x + c.w / 2],
        [c.y + 3 * (c.h / 4), c.x],
        [c.y + c.h / 4, c.x]
      ];
    }
  }
});
