// main class, controller, ...

L.RegularGridCluster = L.GeoJSON.extend({
  options: {
    gridBoundsPadding: 0.1,
    gridMode: 'square',
    cellSize: 10000, // size of the cell at a scale of 10

    showGrid: true,
    showMarkers: true,
    showTexts: true,

    showElementsZoom: 19,

    indexSize: 8,

    rules: {},

  },

  initialize: function (options) {
    this.options = L.extend(this.options, options);
    this.lastelmid = 0;
    L.Util.setOptions(this, options);

    this._elements = {};
    this._cells = [];

    this._grid = new L.regularGridClusterGrid({controller: this});
    this._markers = new L.regularGridClusterMarkersGroup({controller: this});
    this._texts = new L.regularGridClusterTextsGroup({controller: this});

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },

  onAdd: function(map) {
    var that = this;
    this._map = map;
    //L.GeoJSON.prototype.onAdd.call(this, map);

    this._grid.addTo(this._map);
    this._markers.addTo(this._map);
    this._texts.addTo(this._map);

    this._map.on('zoomend', function(){
      that.refresh();
    });
    this._indexCells();
    this.refresh();
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
      this._indexCells();
      this.refresh();
    }
  },

  addData: function (element) {
  },

  refresh: function () {
    this._truncateLayers();
    var time1 = new Date();

    this._prepareCells();
    var time2 = new Date();

    this._findElements();
    var time3 = new Date();

    this._buildGrid();
    var time4 = new Date();

    this._buildMarkers();
    var time5 = new Date();

    this._buildTexts();
    var time6 = new Date();

    console.log('********************');
    console.log('cells prepared in ' + (time2.valueOf() - time1.valueOf()) + 'ms');
    console.log('elements found in ' + (time3.valueOf() - time2.valueOf()) + 'ms');
    console.log('grid built in ' + (time4.valueOf() - time3.valueOf()) + 'ms');
    console.log('markers built in ' + (time5.valueOf() - time4.valueOf()) + 'ms');
    console.log('texts built in ' + (time6.valueOf() - time5.valueOf()) + 'ms');
    console.log(this._cells.length + ' cells refreshed in ' + (time6.valueOf() - time1.valueOf()) + 'ms');
    console.log('********************');
  },

  _truncateLayers: function() {
    this._grid.truncate();
    this._markers.truncate();
    this._texts.truncate();
  },

  // Controlling grid
  _buildGrid: function () {
    if (this.options.rules.grid && this.options.showGrid) {
      this._visualise('grid');

      this._cells.forEach(function (cell) {
        if (this._cellIsNotEmpty(cell)){
          var regularCell = new L.regularGridClusterCell(cell.path, cell.options.grid);
          this._grid.addLayer(regularCell);
        }
      }.bind(this));

      this._grid.addTo(this._map);
    }

  },

  _buildMarkers: function () {
    if (this.options.rules.markers && this.options.showMarkers) {
      this._visualise('markers');

      this._cells.forEach(function (cell) {
        if (this._cellIsNotEmpty(cell)){
          var cellCentroid = [cell.y + cell.h/2, cell.x + cell.w/2];
          var marker = new L.regularGridClusterMarker(cellCentroid, cell.options.markers);
          this._markers.addLayer(marker);
        }
      }.bind(this));

      this._markers.addTo(this._map);
    }

  },

  _buildTexts: function () {
    if (this.options.rules.texts && this.options.showTexts) {
      this._visualise('texts');

      this._cells.forEach(function (cell) {
        if (this._cellIsNotEmpty(cell)){
          var cellCentroid = [cell.y + cell.h/2, cell.x + cell.w/2];
          var text = new L.regularGridClusterText(cellCentroid, cell.options.texts);
          this._texts.addLayer(text);
        }
      }.bind(this));

      this._texts.addTo(this._map);
    }
  },

  _indexCells: function () {
    var origin = this._gridOrigin();
    var gridEnd = this._gridExtent().getNorthEast();
    var maxX = gridEnd.lng,
        maxY = gridEnd.lat;

    var x = origin.lng,
        y = origin.lat;

    var indexPortion = this.options.indexSize;
    var diffX = (maxX - x) / indexPortion;
    var diffY = (maxY - y) / indexPortion;
    this.indexedCells = [];

    for (var xi = x; xi < maxX; xi += diffX){
      for (var yi = y; yi < maxY; yi += diffY){
        var bounds = L.latLngBounds([yi, xi], [yi + diffY, xi + diffX]);
        this.indexedCells.push({
          bounds: bounds,
          cells: []
        });
      }
    }
  },

  _truncateIndexedCells: function () {
    this.indexedCells.forEach(function (indexedCell) {
      indexedCell.cells = [];
    });
  },

  _prepareCells: function () {
    this._cells = [];
    this._truncateIndexedCells();
    var cellId = 1;
    var values = [];

    var cellSize = this._cellSize();

    var origin = this._gridOrigin();
    var gridEnd = this._gridExtent().getNorthEast();
    var maxX = gridEnd.lng,
        maxY = gridEnd.lat;

    var x = origin.lng,
        y = origin.lat;
    var cellW = cellSize/111319;

    while (y < maxY) {
      var cellH = this._cellHeightAtY(y, cellSize);

      while (x < maxX) {
        var cell = {
          id: cellId,
          x: x,
          y: y,
          h: cellH,
          w: cellW,

          options: {
            grid: {},
            markers: {},
            texts: {}
          },

          elms: []
        };
        var cellBounds = L.latLngBounds([y, x], [y + cellH, x + cellW]);

        cell.path = this._cellPath(cell);
        this._cells.push(cell);

        for (var ici in this.indexedCells) {
          var indexedCell = this.indexedCells[ici];
          if (indexedCell.bounds.intersects(cellBounds)){
            indexedCell.cells.push(cell);
          }
        }

        cellId++;
        x += cellW;
      }

      x = origin.lng;
      y += cellH;
    }

  },

  _findElements: function () {
    // var elements = this._getElementsCoordinatesCollection();
    var elements = this._getElementsCollection();
    var cells = this._cells;
    var that = this;

    elements.forEach(function(element) {
      var ei = element.id;

      var ex = element.geometry[1], ey = element.geometry[0];
      var cellsAtIndex = [];

      for (var ici in this.indexedCells) {
        var indexedCell = this.indexedCells[ici];
        if (indexedCell.bounds.contains([ey, ex])) {
          cellsAtIndex = indexedCell.cells;
          break;
        }
      }

      for (var ci in cellsAtIndex) {
        var cell = cellsAtIndex[ci];
        var x1 = cell.x, x2 = cell.x + cell.w, y1 = cell.y, y2 = cell.y + cell.h;

        if (ex > x1) {
          if (ey > y1) {
            if (ex < x2) {
              if (ey < y2) {
                cell.elms.push(ei);
                break;
              }
            }
          }
        }
      }
    }.bind(this));
  },

  _cellIsNotEmpty:function (cell) {
    return cell.elms.length !== 0;
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

  _cellElmsInside: function (cell, elements) {
    return this._cellsInsideOperations[this.options.gridMode].call(this, cell, elements);
  },

  _elmsInsideSquare: function (cell, elements) {
    var elsInside = [];
    var x1 = cell.x, x2 = cell.x + cell.w, y1 = cell.y, y2 = cell.y + cell.h;

    for (var id in elements) {
      var element = elements[id];
      var ex = element[1], ey = element[0];
      if (ex > x1 ) {
        if (ey > y1) {
          if (ex < x2) {
            if (ey < y2) {
              elsInside.push(id);
              delete elements[id];
            }
          }
        }
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

  _getElementsCoordinatesCollection: function (){
    var that = this;
    var elmsJustGeom = {};
    for (var id in this._elements) {
      elmsJustGeom[id] = this._elements[id].geometry;
    }
    return elmsJustGeom;
  },

  _visualise: function (featureType) {
    var that = this;
    if (this.options.rules[featureType]) {

      Object.keys(this.options.rules[featureType]).map(function (option) {
        var rule = that.options.rules[featureType][option];

        if (that._isDynamicalRule(rule)) {
          that._cellsValues(rule.method, rule.attribute);
          that._applyOptions(featureType, rule.scale, rule.style, option);
        } else {
          for (var cj in that._cells) {
            var cell = that._cells[cj];
            if (that._cellIsNotEmpty(cell)) {
              cell.options[featureType][option] = rule;
            }
          }
        }
      });
    }
  },

  _applyOptions: function(featureType, scale, style, option) {
    var values = this._cellValues(true).sort(function(a,b){return a-b;});
    var noInts = style.length;

    if (scale === 'continuous') { noInts = noInts - 1;}
    var max = Math.max.apply(null, values);
    var min = Math.min.apply(null, values);
    var thresholds = [];

    if (scale != 'size') {
      var qLen = Math.floor(values.length / noInts);

      for (var i = 1; i != noInts; i++ ) {
        thresholds.push(values[qLen * i]);
      }
    }

    if (this._scaleOperations[scale]){
      for (var c in this._cells) {
        var cell = this._cells[c];

        if (this._isDefined(cell.value)) {
          cell.options[featureType][option] = this._scaleOperations[scale].call(this, cell.value, min, max, noInts, thresholds, style);
        }
      }
    }
  },

  _cellsValues: function (method, attr) {
    for (var c in this._cells) {
      var cell = this._cells[c];

      if (this._cellIsNotEmpty(cell)){
        var cellValues;

        if (method !== 'count') {
          cellValues = this._cellAttrValues(cell, attr);
        }
        cell.value = this._methodOperations[method].call(this, cell, cellValues);
      }
    }
  },

  _cellValues: function (onlyDefined) {
    var values = [];

    for (var c in this._cells) {

      if (onlyDefined) {
        if (typeof this._cells[c].value !== 'undefined' && !isNaN(this._cells[c].value)) {
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

  _isDynamicalRule: function (rule) {
    return rule.method && rule.scale && rule.style;
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

  // BASE FUNCTIONS
  // longitude delta for given latitude
  _cellHeightAtY: function (y, cellSize) {
    return (cellSize/111319) * this._deltaHeightAtY(y);
  },

  // multiplier for y size at given latitude
  _deltaHeightAtY: function (lat) {
    return Math.abs(1/Math.cos(lat * Math.PI / 180));
  },

  _isDefined: function (value) {
    if (!value && value !== 0) {
      return false;
    } else {
      return true;
    }
  },

  _isNumber: function (value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

});

L.regularGridCluster = function(options) {
  return new L.RegularGridCluster(options);
};
