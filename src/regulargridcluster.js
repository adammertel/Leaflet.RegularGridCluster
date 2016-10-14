// main class, controller, ...

L.RegularGridCluster = L.FeatureGroup.extend({
  options: {
    gridBoundsPadding: 0.1,
    gridMode: 'square',
    cellSize: 10000 // size of the cell at a scale of X
  },

  initialize: function (options) {
    this.options = L.extend(this.options, options)
    L.Util.setOptions(this, options);

    this.elements = [];

    this._grid = new L.regularGridClusterGrid({controller: this});
    this._clusters = new L.regularGridClusterClusterGroup({controller: this});

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },

  onAdd: function(map) {
    var that = this;
    this._map = map;
    //L.FeatureGroup.prototype.onAdd.call(this, map);

    this._grid.addTo(this._map);
    this._clusters.addTo(this._map);

    this._map.on('zoomend', function(){
      that.refresh(true, true);
    });

    this.refresh(true, true);
  },

  addLayer: function (layer) {
    // todo - filter non point and group data
    //console.log(layer);
    L.FeatureGroup.prototype.addLayer.call(this, layer);

    if (this._map) {
      this.refresh(true, true)
    };
  },

  refresh: function (buildGrid, buildCluster) {
    console.log('refresh');
    if (buildGrid) {
      this._buildGrid();
    };

    if (buildCluster) {
      this._buildClusters();
    };
  },

  _buildGrid: function () {
    this._truncateGrid();
    this._prepareCells();
    this._grid.addTo(this._map);
    this._grid.render(this._cellSize(), this.gridOrigin());

  },

  _buildClusters: function () {
    this._truncateClusters();

  },

  _prepareCells: function () {
    var cellSize = this._cellSize()
    var origin = this.gridOrigin();
    var gridEnd = this.gridExtent().getNorthEast();
    var maxX = gridEnd.lng,
      maxY = gridEnd.lat;

    var x = origin.lng;
    var y = origin.lat;

    var cellW = cellSize/111319;

    while (y < maxY) {
      var cellH = this._cellHeightAtY(y, cellSize);

      while (x < maxX) {
        var path = this._createPath(x, y, cellH, cellW);
        var newCell = this._createCell(path, {});

        x += cellW;
      };

      x = origin.lng;
      y += cellH;
    };
  },

  _createPath: function (x, y, h, w) {
    switch (this.options.gridMode) {
      case 'square':
        return [[y, x], [y, x + w], [y + h, x + w], [y + h, x], [y, x]];
        break;
      default:
        return [[y, x], [y, x + w], [y + h, x + w], [y + h, x], [y, x]];
        break;
    }
  },

  // TODO
  countInside: function (cell) {
    switch (this.options.gridMode) {
      case 'square':
        return this._countInsideSquare(cell);
        break;
      default:
        return this._countInsideSquare(cell);
        break;
    };
  },

  _countInsideSquare: function (cell) {
    var count = 0;
    var bounds = cell.getBounds();
    var elements = this.getElements();

    for (var e in elements) {
      var element = elements[e];
      if (bounds.contains(element._latlng)){
        count++;
      };
    };

    return count;
  },

  getElements: function (){
    return this.getLayers();
  },

  // longitude delta for given latitude
  _cellHeightAtY: function (y, cellSize) {
    return Math.abs((cellSize/111319) * (1/Math.cos(y * Math.PI / 180)));
  },

  _createCell: function (path, options) {
    return this._grid.createCell(path, options);
  },

  _truncateGrid: function () {
    this._grid.truncate();
  },

  _truncateClusters: function () {
    this._clusters.truncate()
  },

  // return size of the cell in meters
  _cellSize: function () {
    return this.options.cellSize * Math.pow(2, 10 - this._mapZoom())
  },

  gridExtent: function () {
    return this.getBounds().pad(this.options.gridBoundsPadding);
  },

  gridOrigin: function () {
    return this.gridExtent().getSouthWest();
  },

  _mapZoom: function () {
    if (this._map) {
      return this._map.getZoom();
    } else {
      return false;
    }
  },

  _calculateGridOrigin: function() {

  }
});

L.regularGridCluster = function(options) {
  return new L.RegularGridCluster(options);
};
