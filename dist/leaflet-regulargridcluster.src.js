L.RegularGridClusterCell = L.Polygon.extend({
    options: {
        weight: 1,
        fillOpacity: .6,
        clickable: false,
        color: "grey",
        lineJoin: "miter",
        fillRule: "evenodd",
        strokeLocation: "inside"
    },
    initialize: function(path, options) {
        this.options = L.extend(this.options, options);
        L.Util.setOptions(this, this.options);
        L.Polygon.prototype.initialize.call(this, path, this.options);
    }
});

L.regularGridClusterCell = function(path, options) {
    return new L.RegularGridClusterCell(path, options);
};

L.RegularGridClusterClusterGroup = L.FeatureGroup.extend({
    options: {},
    initialize: function(options) {
        this.controller = options.controller;
        this.options = L.extend(this.options, options);
        L.Util.setOptions(this, options);
        L.FeatureGroup.prototype.initialize.call(this, {
            features: []
        }, options);
    },
    addLayer: function(layer) {
        L.FeatureGroup.prototype.addLayer.call(this, layer);
    },
    truncate: function() {
        this.clearLayers();
    }
});

L.regularGridClusterClusterGroup = function(options) {
    return new L.RegularGridClusterClusterGroup(options);
};

L.RegularGridClusterClusterMarker = L.Marker.extend({
    options: {},
    initialize: function(options) {
        this.options = L.extend(this.options, options);
        L.Util.setOptions(this, options);
        L.Marker.prototype.initialize.call(this, {
            features: []
        }, options);
    }
});

L.regularGridClusterClusterMarker = function(options) {
    return new L.RegularGridClusterClusterMarker(options);
};

L.RegularGridClusterGrid = L.FeatureGroup.extend({
    options: {},
    initialize: function(options) {
        this.controller = options.controller;
        this.cellid = 0;
        this.options = L.extend(this.options, options);
        this.cells = [];
        L.Util.setOptions(this, options);
        L.FeatureGroup.prototype.initialize.call(this, {
            features: []
        }, options);
    },
    render: function(cellSize, origin) {
        this.visualiseCells();
        console.log(cellSize);
        console.log(origin);
    },
    createCell: function(path, options) {
        var newCell = new L.regularGridClusterCell(path, options);
        newCell.cellId = this.cellid;
        this.addLayer(newCell);
        this.cellid++;
        return newCell;
    },
    addValueToCell: function(cell, attrName, value) {
        cell.options[attrName] = value;
    },
    visualiseCells: function() {
        var cells = this.getCells();
        var maxInside = this.maxInside(cells) + 1;
        var intervals = this.options.fillScale.length;
        var d = maxInside / intervals;
        for (var c in cells) {
            var cell = cells[c];
            var cellColor = this.options.fillScale[Math.floor(cell.inside / d)];
            cell.setStyle({
                fillColor: cellColor
            });
        }
    },
    maxInside: function(cells) {
        return Math.max.apply(Math, cells.map(function(o) {
            return o.inside;
        }));
    },
    getCells: function() {
        return this.getLayers();
    },
    truncate: function() {
        this.clearLayers();
    }
});

L.regularGridClusterGrid = function(options) {
    return new L.RegularGridClusterGrid(options);
};

L.RegularGridCluster = L.GeoJSON.extend({
    options: {
        gridBoundsPadding: .1,
        gridMode: "square",
        cellSize: 1e4,
        rules: {},
        gridFillColor: "white",
        gridFillOpacity: .05,
        gridStrokeColor: "grey",
        gridStrokeWeight: 2,
        gridStrokeOpacity: .4
    },
    initialize: function(options) {
        this.options = L.extend(this.options, options);
        this.lastelmid = 0;
        L.Util.setOptions(this, options);
        this._elements = {};
        this._cells = [];
        this._grid = new L.regularGridClusterGrid({
            controller: this
        });
        this._clusters = new L.regularGridClusterClusterGroup({
            controller: this
        });
        L.FeatureGroup.prototype.initialize.call(this, {
            features: []
        }, options);
    },
    onAdd: function(map) {
        var that = this;
        this._map = map;
        this._grid.addTo(this._map);
        this._clusters.addTo(this._map);
        this._map.on("zoomend", function() {
            that.refresh(true, true);
        });
        this.refresh(true, true);
    },
    addElement: function(element) {
        this._elements[this.lastelmid] = {
            id: this.lastelmid,
            geometry: element.geometry.coordinates,
            properties: element.properties
        };
        this.lastelmid++;
        if (this._map) {
            this.refresh(true, true);
        }
    },
    addData: function(element) {},
    refresh: function(buildGrid, buildCluster) {
        console.log("refresh");
        this._prepareCells();
        if (buildGrid) {
            this._buildGrid();
        }
        if (buildCluster) {
            this._buildClusters();
        }
    },
    _visualiseCells: function() {
        var that = this;
        Object.keys(this.options.rules.grid).map(function(option) {
            var rule = that.options.rules.grid[option];
            if (that._isDynamicalRule(rule)) {
                that._cellsValues(rule.method, rule.attribute);
                that._applyOptions(rule.scale, rule.style, option);
            } else {
                for (var cj in that._cells) {
                    that._cells[cj].options[option] = rule;
                }
            }
        });
    },
    _applyOptions: function(scale, style, option) {
        var values = this._cellValues(true).sort(function(a, b) {
            return a - b;
        });
        var noInts = style.length;
        if (scale === "continuous") {
            noInts = noInts - 1;
        }
        var max = Math.max.apply(null, values);
        var min = Math.min.apply(null, values);
        var diff = max - min;
        var thresholds = [];
        if (scale != "size") {
            var qLen = Math.floor(values.length / noInts);
            for (var i = 1; i != noInts; i++) {
                thresholds.push(values[qLen * i]);
            }
        }
        for (var c in this._cells) {
            var cell = this._cells[c];
            var value = cell.value;
            var interval;
            if (this._isDefined(value)) {
                switch (scale) {
                  case "size":
                    interval = noInts - 1;
                    if (value < max) {
                        interval = Math.floor((value - min) / diff * noInts);
                    }
                    cell.options[option] = style[interval];
                    break;

                  case "quantile":
                    interval = 0;
                    for (var ti in thresholds) {
                        if (value > thresholds[ti]) {
                            interval = parseInt(ti) + 1;
                        }
                    }
                    cell.options[option] = style[interval];
                    break;

                  case "continuous":
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
                    cell.options[option] = styleValue;
                    break;
                }
            }
        }
    },
    _cellsValues: function(method, attr) {
        for (var c in this._cells) {
            var cell = this._cells[c];
            var cellValues;
            switch (method) {
              case "count":
                cell.value = cell.elms.length;
                break;

              case "mean":
                cellValues = this._cellAttrValues(cell, attr);
                cell.value = this._math_mean(cellValues);
                break;

              case "median":
                cellValues = this._cellAttrValues(cell, attr);
                cell.value = this._math_median(cellValues);
                break;

              case "mode":
                cellValues = this._cellAttrValues(cell, attr);
                cell.value = this._math_mode(cellValues);
                break;

              case "max":
                cellValues = this._cellAttrValues(cell, attr);
                cell.value = this._math_max(cellValues);
                break;

              case "min":
                cellValues = this._cellAttrValues(cell, attr);
                cell.value = this._math_min(cellValues);
                break;

              case "sum":
                cellValues = this._cellAttrValues(cell, attr);
                cell.value = this._math_sum(cellValues);
                break;
            }
        }
    },
    _cellValues: function(onlyDefined) {
        var values = [];
        for (var c in this._cells) {
            if (onlyDefined) {
                if (typeof this._cells[c].value !== "undefined" && !isNaN(this._cells[c].value)) {
                    values.push(this._cells[c].value);
                }
            } else {
                values.push(this._cells[c].value);
            }
        }
        return values;
    },
    _cellAttrValues: function(cell, attr) {
        var values = [];
        for (var e in cell.elms) {
            values.push(this._elements[cell.elms[e]].properties[attr]);
        }
        return values;
    },
    _isDynamicalRule: function(rule) {
        return rule.method && rule.scale && rule.style;
    },
    _buildGrid: function() {
        this._truncateGrid();
        this._visualiseCells();
        for (var c in this._cells) {
            var cell = this._cells[c];
            var regularCell = new L.regularGridClusterCell(cell.path, cell.options);
            if (cell.value) {
                this._grid.addLayer(regularCell);
            }
        }
        this._grid.addTo(this._map);
    },
    _truncateGrid: function() {
        this._grid.truncate();
    },
    _buildClusters: function() {
        this._truncateClusters();
    },
    _prepareCells: function() {
        this._cells = [];
        var cellId = 1;
        var values = [];
        var cellSize = this._cellSize();
        var origin = this._gridOrigin();
        var gridEnd = this._gridExtent().getNorthEast();
        var maxX = gridEnd.lng, maxY = gridEnd.lat;
        var x = origin.lng;
        var y = origin.lat;
        var cellW = cellSize / 111319;
        while (y < maxY) {
            var cellH = this._cellHeightAtY(y, cellSize);
            while (x < maxX) {
                var cell = {
                    id: cellId,
                    x: x,
                    y: y,
                    h: cellH,
                    w: cellW,
                    options: {}
                };
                cell.path = this._cellPath(cell);
                cell.elms = this._cellElmsInside(cell);
                this._cells.push(cell);
                cellId++;
                x += cellW;
            }
            x = origin.lng;
            y += cellH;
        }
        console.log("created " + this._cells.length + " cells");
    },
    _cellPath: function(cell) {
        var c = cell;
        switch (this.options.gridMode) {
          case "square":
            return [ [ c.y, c.x ], [ c.y, c.x + c.w ], [ c.y + c.h, c.x + c.w ], [ c.y + c.h, c.x ], [ c.y, c.x ] ];

          default:
            return [ [ c.y, c.x ], [ c.y, c.x + c.w ], [ c.y + c.h, c.x + c.w ], [ c.y + c.h, c.x ], [ c.y, c.x ] ];
        }
    },
    _cellElmsInside: function(cell) {
        switch (this.options.gridMode) {
          case "square":
            return this._elmsInsideSquare(cell);

          default:
            return this._elmsInsideSquare(cell);
        }
    },
    _elmsInsideSquare: function(cell) {
        var elsInside = [];
        var bounds = new L.latLngBounds(L.latLng(cell.y, cell.x), L.latLng(cell.y + cell.h, cell.x + cell.w));
        var elements = this._getElementsCollection();
        for (var e in elements) {
            var element = elements[e];
            if (bounds.contains(element.geometry)) {
                elsInside.push(element.id);
            }
        }
        return elsInside;
    },
    _getElementsCollection: function() {
        var that = this;
        return Object.keys(this._elements).map(function(key) {
            return that._elements[key];
        });
    },
    _createCell: function(path, options) {
        return this._grid.createCell(path, options);
    },
    _truncateClusters: function() {
        this._clusters.truncate();
    },
    _cellSize: function() {
        return this.options.cellSize * Math.pow(2, 10 - this._mapZoom());
    },
    _gridOrigin: function() {
        return this._gridExtent().getSouthWest();
    },
    _gridExtent: function() {
        return this._getBounds().pad(this.options.gridBoundsPadding);
    },
    _getBounds: function() {
        var coordinates = this._getGeometries();
        return L.latLngBounds(coordinates);
    },
    _getGeometries: function() {
        var geometries = [];
        var elements = this._getElementsCollection();
        for (var e in elements) {
            geometries.push(elements[e].geometry);
        }
        return geometries;
    },
    _mapZoom: function() {
        if (this._map) {
            return this._map.getZoom();
        } else {
            return false;
        }
    },
    _calculateGridOrigin: function() {},
    _cellHeightAtY: function(y, cellSize) {
        return cellSize / 111319 * this._deltaHeightAtY(y);
    },
    _deltaHeightAtY: function(lat) {
        return Math.abs(1 / Math.cos(lat * Math.PI / 180));
    },
    _math_max: function(arr) {
        if (arr.length) {
            return Math.max.apply(null, arr.map(function(o) {
                if (o) {
                    return o;
                } else {
                    return 0;
                }
            }));
        } else {
            return undefined;
        }
    },
    _math_min: function(arr) {
        if (arr.length) {
            return Math.min.apply(null, arr.map(function(o) {
                if (o) {
                    return o;
                } else {
                    return 99999;
                }
            }));
        } else {
            return undefined;
        }
    },
    _math_mode: function(arr) {
        if (arr.length === 0) {
            return null;
        }
        var modeMap = {};
        var maxEl = arr[0], maxCount = 1;
        for (var i = 0; i < arr.length; i++) {
            var el = arr[i];
            if (el) {
                if (modeMap[el] === null) {
                    modeMap[el] = 1;
                } else {
                    modeMap[el]++;
                }
                if (modeMap[el] > maxCount) {
                    maxEl = el;
                    maxCount = modeMap[el];
                }
            }
        }
        return maxEl;
    },
    _math_mean: function(arr) {
        var state = arr.reduce(function(state, a) {
            if (a) {
                state.sum += a;
                state.count += 1;
            }
            return state;
        }, {
            sum: 0,
            count: 0
        });
        return state.sum / state.count;
    },
    _math_sum: function(arr) {
        if (arr.length === 0) {
            return 0;
        }
        return arr.reduce(function(a, b) {
            if (b) {
                return a + b;
            } else {
                return 0;
            }
        }, 0);
    },
    _math_median: function(arr) {
        arr.sort(function(a, b) {
            return a - b;
        });
        var half = Math.floor(arr.length / 2);
        if (arr.length % 2) {
            return arr[half];
        } else {
            return (arr[half - 1] + arr[half]) / 2;
        }
    },
    _colorNameToHex: function(color) {
        var colors = {
            aliceblue: "#f0f8ff",
            antiquewhite: "#faebd7",
            aqua: "#00ffff",
            aquamarine: "#7fffd4",
            azure: "#f0ffff",
            beige: "#f5f5dc",
            bisque: "#ffe4c4",
            black: "#000000",
            blanchedalmond: "#ffebcd",
            blue: "#0000ff",
            blueviolet: "#8a2be2",
            brown: "#a52a2a",
            burlywood: "#deb887",
            cadetblue: "#5f9ea0",
            chartreuse: "#7fff00",
            chocolate: "#d2691e",
            coral: "#ff7f50",
            cornflowerblue: "#6495ed",
            cornsilk: "#fff8dc",
            crimson: "#dc143c",
            cyan: "#00ffff",
            darkblue: "#00008b",
            darkcyan: "#008b8b",
            darkgoldenrod: "#b8860b",
            darkgray: "#a9a9a9",
            darkgreen: "#006400",
            darkkhaki: "#bdb76b",
            darkmagenta: "#8b008b",
            darkolivegreen: "#556b2f",
            darkorange: "#ff8c00",
            darkorchid: "#9932cc",
            darkred: "#8b0000",
            darksalmon: "#e9967a",
            darkseagreen: "#8fbc8f",
            darkslateblue: "#483d8b",
            darkslategray: "#2f4f4f",
            darkturquoise: "#00ced1",
            darkviolet: "#9400d3",
            deeppink: "#ff1493",
            deepskyblue: "#00bfff",
            dimgray: "#696969",
            dodgerblue: "#1e90ff",
            firebrick: "#b22222",
            floralwhite: "#fffaf0",
            forestgreen: "#228b22",
            fuchsia: "#ff00ff",
            gainsboro: "#dcdcdc",
            ghostwhite: "#f8f8ff",
            gold: "#ffd700",
            goldenrod: "#daa520",
            gray: "#808080",
            green: "#008000",
            greenyellow: "#adff2f",
            honeydew: "#f0fff0",
            hotpink: "#ff69b4",
            "indianred ": "#cd5c5c",
            indigo: "#4b0082",
            ivory: "#fffff0",
            khaki: "#f0e68c",
            lavender: "#e6e6fa",
            lavenderblush: "#fff0f5",
            lawngreen: "#7cfc00",
            lemonchiffon: "#fffacd",
            lightblue: "#add8e6",
            lightcoral: "#f08080",
            lightcyan: "#e0ffff",
            lightgoldenrodyellow: "#fafad2",
            lightgrey: "#d3d3d3",
            lightgreen: "#90ee90",
            lightpink: "#ffb6c1",
            lightsalmon: "#ffa07a",
            lightseagreen: "#20b2aa",
            lightskyblue: "#87cefa",
            lightslategray: "#778899",
            lightsteelblue: "#b0c4de",
            lightyellow: "#ffffe0",
            lime: "#00ff00",
            limegreen: "#32cd32",
            linen: "#faf0e6",
            magenta: "#ff00ff",
            maroon: "#800000",
            mediumaquamarine: "#66cdaa",
            mediumblue: "#0000cd",
            mediumorchid: "#ba55d3",
            mediumpurple: "#9370d8",
            mediumseagreen: "#3cb371",
            mediumslateblue: "#7b68ee",
            mediumspringgreen: "#00fa9a",
            mediumturquoise: "#48d1cc",
            mediumvioletred: "#c71585",
            midnightblue: "#191970",
            mintcream: "#f5fffa",
            mistyrose: "#ffe4e1",
            moccasin: "#ffe4b5",
            navajowhite: "#ffdead",
            navy: "#000080",
            oldlace: "#fdf5e6",
            olive: "#808000",
            olivedrab: "#6b8e23",
            orange: "#ffa500",
            orangered: "#ff4500",
            orchid: "#da70d6",
            palegoldenrod: "#eee8aa",
            palegreen: "#98fb98",
            paleturquoise: "#afeeee",
            palevioletred: "#d87093",
            papayawhip: "#ffefd5",
            peachpuff: "#ffdab9",
            peru: "#cd853f",
            pink: "#ffc0cb",
            plum: "#dda0dd",
            powderblue: "#b0e0e6",
            purple: "#800080",
            red: "#ff0000",
            rosybrown: "#bc8f8f",
            royalblue: "#4169e1",
            saddlebrown: "#8b4513",
            salmon: "#fa8072",
            sandybrown: "#f4a460",
            seagreen: "#2e8b57",
            seashell: "#fff5ee",
            sienna: "#a0522d",
            silver: "#c0c0c0",
            skyblue: "#87ceeb",
            slateblue: "#6a5acd",
            slategray: "#708090",
            snow: "#fffafa",
            springgreen: "#00ff7f",
            steelblue: "#4682b4",
            tan: "#d2b48c",
            teal: "#008080",
            thistle: "#d8bfd8",
            tomato: "#ff6347",
            turquoise: "#40e0d0",
            violet: "#ee82ee",
            wheat: "#f5deb3",
            white: "#ffffff",
            whitesmoke: "#f5f5f5",
            yellow: "#ffff00",
            yellowgreen: "#9acd32"
        };
        if (typeof colors[color.toLowerCase()] != "undefined") {
            return colors[color.toLowerCase()].substring(1);
        } else {
            return false;
        }
    },
    _hex: function(x) {
        x = x.toString(16);
        return x.length == 1 ? "0" + x : x;
    },
    _validateColor: function(color) {
        if (color.indexOf("#") == -1) {
            return this._colorNameToHex(color);
        } else {
            return color.substring(1);
        }
    },
    _colorMix: function(color1, color2, ratio) {
        color1 = this._validateColor(color1);
        color2 = this._validateColor(color2);
        var r = Math.floor(parseInt(color1.substring(0, 2), 16) * ratio + parseInt(color2.substring(0, 2), 16) * (1 - ratio));
        var g = Math.floor(parseInt(color1.substring(2, 4), 16) * ratio + parseInt(color2.substring(2, 4), 16) * (1 - ratio));
        var b = Math.floor(parseInt(color1.substring(4, 6), 16) * ratio + parseInt(color2.substring(4, 6), 16) * (1 - ratio));
        return "#" + this._hex(r) + this._hex(g) + this._hex(b);
    },
    _isDefined: function(value) {
        if (!value && value !== 0) {
            return false;
        } else {
            return true;
        }
    },
    _isNumber: function(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
});

L.regularGridCluster = function(options) {
    return new L.RegularGridCluster(options);
};