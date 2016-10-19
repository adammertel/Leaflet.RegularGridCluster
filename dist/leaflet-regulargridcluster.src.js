L.RegularGridClusterCell = L.Polygon.extend({
    options: {
        weight: 1,
        fillOpacity: .6,
        clickable: false,
        color: "grey",
        lineJoin: "miter"
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
                console.log(rule);
                that._cellsValues(rule.method, rule.attribute);
                var vMax = Math.max.apply(null, that._cells.map(function(o) {
                    if (o.value) {
                        return o.value;
                    } else {
                        return 0;
                    }
                }));
                var vMin = Math.min.apply(null, that._cells.map(function(o) {
                    if (o.value) {
                        return o.value;
                    } else {
                        return 9999999999;
                    }
                }));
                var noInts = rule.style.length;
                var vDiff = vMax - vMin;
                for (var c in that._cells) {
                    var cell = that._cells[c];
                    var cellValue = that._cells[c].value;
                    var interval = that._getCellInterval(cellValue, vMin, vMax, vDiff, noInts, rule.scale);
                    cell.options[option] = rule.style[interval];
                }
                console.log(that._cells);
            } else {
                for (var cj in that._cells) {
                    that._cells[cj].options[option] = rule;
                }
            }
        });
    },
    _getCellInterval: function(value, min, max, diff, noInts, scale) {
        switch (scale) {
          case "size":
            if (value == max) {
                return noInts - 1;
            } else {
                return Math.floor((value - min) / diff * noInts);
            }
            break;

          default:
            if (value == max) {
                return noInts - 1;
            } else {
                return Math.floor((value - min) / diff * noInts);
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
            }
        }
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
    }
});

L.regularGridCluster = function(options) {
    return new L.RegularGridCluster(options);
};