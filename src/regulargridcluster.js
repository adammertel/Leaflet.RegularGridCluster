// main class, controller, ...

L.RegularGridCluster = L.GeoJSON.extend({
  options: {
    gridBoundsPadding: 0.1,
    gridMode: 'square',
    cellSize: 10000, // size of the cell at a scale of 10

    rules: {},

    // default style
    gridFillColor: 'white',
    gridFillOpacity: 0.05,
    gridStrokeColor: 'grey',
    gridStrokeWeight: 2,
    gridStrokeOpacity: 0.4,

  },

  initialize: function (options) {
    this.options = L.extend(this.options, options);
    this.lastelmid = 0;
    L.Util.setOptions(this, options);

    this._elements = {};
    this._cells = [];

    this._grid = new L.regularGridClusterGrid({controller: this});
    this._clusters = new L.regularGridClusterClusterGroup({controller: this});

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },

  onAdd: function(map) {
    var that = this;
    this._map = map;
    //L.GeoJSON.prototype.onAdd.call(this, map);

    this._grid.addTo(this._map);
    this._clusters.addTo(this._map);

    this._map.on('zoomend', function(){
      that.refresh(true, true);
    });

    this.refresh(true, true);
  },

  addElement: function (element) {

    // todo - filter non point and group data
    this._elements[this.lastelmid] = {
      "id": this.lastelmid,
      "geometry": element.geometry.coordinates,
      "properties": element.properties
    };

    this.lastelmid++;

    //L.GeoJSON.prototype.addData.call(this, element);

    if (this._map) {
      this.refresh(true, true);
    }
  },

  addData: function (element) {
  },

  refresh: function (buildGrid, buildCluster) {
    console.log('refresh');
    this._prepareCells();
    if (buildGrid) {
      this._buildGrid();
    }

    if (buildCluster) {
      this._buildClusters();
    }
  },

  // applying rules to grid - styling
  _visualiseCells: function () {
    var that = this;
    Object.keys(this.options.rules.grid).map(function (option) {

      var rule = that.options.rules.grid[option];

      if (that._validateRule(rule)) {
        console.log(rule);
        var values = that._getCellsValues(rule.method, rule.attribute);

        var vMax = Math.max.apply(null, values);
        var vMin = Math.min.apply(null, values);
        var noInts = rule.style.length;
        var vDiff = vMax - vMin;

        //var thresholds = that._getIntervalThresholds(values, rule, scale);
        for (var c in that._cells) {
          var cell = that._cells[c];
          //console.log(((cell.elms.length - vMin)/vDiff));
          //console.log(Math.floor(((cell.elms.length - vMin)/vDiff) ));
          //var cellValue = _.getValue(cell, rule.method, rule.attribute);
          //var interval = _.getInterval(value, vMin, vMax, noInts, rule.scale);
          var interval = Math.floor(((cell.elms.length - vMin)/vDiff) * noInts);
          cell.options[option] = rule.style[interval] || rule.style[rule.style.length - 1];
        }

        console.log(that._cells);
      }
    });
  },

  _getCellsValues: function (method, attr) {
    var values = [];

    switch (method) {
      case 'count':
        for (var c in this._cells) {
          var cell = this._cells[c];
          values.push(cell.elms.length);
        }
        return values;
    }
  },

  _validateRule: function (rule) {
    return rule.method && rule.scale && rule.style;
  },

  // Controlling grid
  _buildGrid: function () {
    this._truncateGrid();
    this._visualiseCells();
    for (var c in this._cells) {
      var cell = this._cells[c];
      var regularCell = new L.regularGridClusterCell(cell.path, cell.options);
      this._grid.addLayer(regularCell);
    }

    this._grid.addTo(this._map);
  },

  _truncateGrid: function () {
    this._grid.truncate();
  },

  _buildClusters: function () {
    this._truncateClusters();
  },

  _prepareCells: function () {
    this._cells = [];
    var cellId = 1;
    var values = [];

    var cellSize = this._cellSize();
    var origin = this._gridOrigin();
    var gridEnd = this._gridExtent().getNorthEast();
    var maxX = gridEnd.lng,
      maxY = gridEnd.lat;

    var x = origin.lng;
    var y = origin.lat;

    var cellW = cellSize/111319;

    while (y < maxY) {
      var cellH = this._cellHeightAtY(y, cellSize);

      while (x < maxX) {
        //var path = this._createPath(x, y, cellH, cellW);
        //var newCell = this._createCell(path, {});

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

    console.log('created ' + this._cells.length + ' cells');
  },

  _cellPath: function (cell) {
    var c = cell;
    switch (this.options.gridMode) {
      case 'square':
        return [[c.y, c.x], [c.y, c.x + c.w], [c.y + c.h, c.x + c.w], [c.y + c.h, c.x], [c.y, c.x]];
      default:
        return [[c.y, c.x], [c.y, c.x + c.w], [c.y + c.h, c.x + c.w], [c.y + c.h, c.x], [c.y, c.x]];
    }
  },

  // TODO
  _cellElmsInside: function (cell) {
    switch (this.options.gridMode) {
      case 'square':
        return this._elmsInsideSquare(cell);
      default:
        return this._elmsInsideSquare(cell);
    }
  },

  _elmsInsideSquare: function (cell) {
    var elsInside = [];
    var bounds = new L.latLngBounds(
      L.latLng(cell.y, cell.x),
      L.latLng(cell.y + cell.h, cell.x + cell.w)
    );
    var elements = this._getElementsCollection();

    for (var e in elements) {
      var element = elements[e];
      if (bounds.contains(element.geometry)){
        elsInside.push(element.id);
      }
    }

    return elsInside;
  },

  _getElementsCollection: function (){
    var that = this;
    return Object.keys(this._elements).map(function (key) {
      return that._elements[key];
    });
  },

  _createCell: function (path, options) {
    return this._grid.createCell(path, options);
  },

  _truncateClusters: function () {
    this._clusters.truncate();
  },

  // return size of the cell in meters
  _cellSize: function () {
    return this.options.cellSize * Math.pow(2, 10 - this._mapZoom());
  },

  _gridOrigin: function () {
    return this._gridExtent().getSouthWest();
  },

  _gridExtent: function () {
    return this._getBounds().pad(this.options.gridBoundsPadding);
  },

  _getBounds: function () {
    var coordinates = this._getGeometries();
    return L.latLngBounds(coordinates);
  },

  _getGeometries: function () {
    var geometries = [];
    var elements = this._getElementsCollection();
    for (var e in elements) {
      geometries.push(elements[e].geometry);
    }
    return geometries;
  },

  _mapZoom: function () {
    if (this._map) {
      return this._map.getZoom();
    } else {
      return false;
    }
  },

  _calculateGridOrigin: function() {

  },

  // BASE FUNCTIONS
  // longitude delta for given latitude
  _cellHeightAtY: function (y, cellSize) {
    return (cellSize/111319) * this._deltaHeightAtY(y);
  },

  // multiplier for y size at given latitude
  _deltaHeightAtY: function (lat) {
    return Math.abs(1/Math.cos(lat * Math.PI / 180));
  },
});

L.regularGridCluster = function(options) {
  return new L.RegularGridCluster(options);
};
