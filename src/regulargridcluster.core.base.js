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

    indexSize: 12,

    rules: {},
    trackingTime: true // for developement purposes 

  },

  initialize: function (options) {
    this.options = L.extend(this.options, options);
    this.lastelmid = 0;
    this.elementDisplayed = false;
    L.Util.setOptions(this, options);


    this._actions = []; 
    this._elements = {};
    this._displayedElsGroup = L.featureGroup([]);
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
  
    this._addAction(this._map.on('zoomend', function(){ that.refresh();}));
    this._index();
    this.refresh();
  },

  _addAction: function (action) {
    this._actions.push(action);
  },

  _unregisterActions: function () {
    for (var ai in this._actions) {
      var action = this._actions[ai];
      action.off();
    }
  },

  addLayer: function (layer) {
    this.addLayers([layer]);
  },

  addLayers: function (layersArray) {
    for (var li in layersArray) {
      this._addPoint(layersArray[li]);
    }
  },

  unregister: function () {
    this.clearLayers();
    this._unregisterActions();

    this._map.removeLayer(this._grid);
    this._map.removeLayer(this._markers);
    this._map.removeLayer(this._texts);
    this._map.removeLayer(this._displayedElsGroup);    
  },

  _addPoint: function (element) {
    // todo - filter non point and group data
    this._elements[this.lastelmid] = {
      "id": this.lastelmid,
      "geometry": element.geometry.coordinates,
      "properties": element.properties
    };

    this.lastelmid++;
    //L.GeoJSON.prototype.addData.call(this, element);

    if (this._map) {
      this._index();
      this.refresh();
    }
  },

  _index: function () {
    var times = [];
    times.push(new Date());
    this._indexCells();
    times.push(new Date());
    this._indexElements();
    times.push(new Date());

    if (this.options.trackingTime) {
      console.log('//////////////////////////////////');
      console.log('cells indexed in    ' + (times[1].valueOf() - times[0].valueOf()) + 'ms');
      console.log('elements indexed in ' + (times[2].valueOf() - times[1].valueOf()) + 'ms');
      console.log('indexing took       ' + (times[2].valueOf() - times[0].valueOf()) + 'ms');
      console.log('//////////////////////////////////');
    }

  },

  _displayElements: function () {
    if (!this.elementDisplayed) {
      this._displayedElsGroup.clearLayers();
      this.elementDisplayed = true;
      var elements = this._getElementsCollection();

      elements.forEach(function (element) {
        //console.log(element);
        this._displayedElsGroup.addLayer(
          L.circleMarker(
            [element.g[0], element.g[1]],
            50,
            {fillColor: 'lightblue', stroke: false}
          )
        );
      }.bind(this));

      this._displayedElsGroup.addTo(this._map);
    }
  },

  _hideElements: function () {
    if (this.elementDisplayed) {
      this.elementDisplayed = false;
      this._displayedElsGroup.clearLayers();
    }
  },

  refresh: function () {
    var zoom = this._map.getZoom();

    if (zoom > this.options.showElementsZoom) {
      console.log('elements will be displayed');
      this._displayElements();
    } else {
      console.log('elements will be hidden');
      this._hideElements();
      this._truncateLayers();

      var times = [];

      times.push(new Date());

      this._prepareCells();
      times.push(new Date());

      this._findElements();
      times.push(new Date());

      this._buildGrid();
      times.push(new Date());

      this._buildMarkers();
      times.push(new Date());

      this._buildTexts();
      times.push(new Date());
      
      if (this.options.trackingTime) {
        console.log('********************');
        console.log('cells prepared in ' + (times[1].valueOf() - times[0].valueOf()) + 'ms');
        console.log('elements found in ' + (times[2].valueOf() - times[1].valueOf()) + 'ms');
        console.log('grid built in     ' + (times[3].valueOf() - times[2].valueOf()) + 'ms');
        console.log('markers built in  ' + (times[4].valueOf() - times[3].valueOf()) + 'ms');
        console.log('texts built in    ' + (times[5].valueOf() - times[4].valueOf()) + 'ms');
        console.log(this._cells.length + ' cells refreshed in ' + (times[5].valueOf() - times[0].valueOf()) + 'ms');
        console.log('********************');
      }
    }

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
    this._indexedCells = {};

    var cellId = 0;

    for (var xi = x; xi < maxX; xi += diffX){
      for (var yi = y; yi < maxY; yi += diffY){
        var bounds = L.latLngBounds([yi, xi], [yi + diffY, xi + diffX]);
        this._indexedCells[cellId] = {
          b: bounds,
          cs: []
        };
        cellId = cellId + 1;
      }
    }
  },

  _indexElements: function () {
    var elements = this._getElementsCollection();

    elements.forEach(function(element) {
      for (var ici in this._indexedCells) {
        var indexedCell = this._indexedCells[ici];
        if (indexedCell.b.contains(element.g)) {
          this._elements[element.id].index = ici;
          break;
        }
      }


    }.bind(this));
  },

  _indexedCellsCollection: function () {
    var that = this;
    return Object.keys(this._indexedCells).map(function (key) {
      return that._indexedCells[key];
    });
  },

  _truncateIndexedCells: function () {
    var indexedCellsCollection = this._indexedCellsCollection();
    indexedCellsCollection.forEach(function(indexedCell) {
      indexedCell.cs = [];
    });
  },

  _prepareCells: function () {
    this._cells = [];
    this._truncateIndexedCells();
    var cellId = 1;

    var cellSize = this._cellSize();

    var origin = this._gridOrigin();
    var gridEnd = this._gridExtent().getNorthEast();
    var maxX = gridEnd.lng,
        maxY = gridEnd.lat;

    var x = origin.lng,
        y = origin.lat;
    var cellW = cellSize/111319;

    var indexedCellsCollection = this._indexedCellsCollection();
    var row = 1;

    while (y < maxY) {
      var cellH = this._cellHeightAtY(y, cellSize);

      if (this.options.gridMode == 'hexagon') {
        if (row%2) {
          x -= cellW/2;
        }
      }

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

        cell.path = this._buildPathOperations[this.options.gridMode].call(this, cell);
        this._cells.push(cell);

        for (var icci in indexedCellsCollection) {
          indexedCell = indexedCellsCollection[icci];
          if (indexedCell.b.overlaps(cellBounds)){
            indexedCell.cs.push(cell);
          }
        }

        cellId++;

        // if (this.options.gridMode == 'hexagon') {
        //   x += (1/Math.sqrt(3)/2) * cellW;
        // } else {
        //   x += cellW;
        // }
        x += cellW;
      }

      x = origin.lng;
      //y += cellH;
      if (this.options.gridMode == 'hexagon') {
        y += 3/4 * cellH;
      } else {
        y += cellH;
      }
      row += 1;
    }

  },

  _findElements: function () {
    var elements = this._getElementsCollection();

    elements.forEach(function(element) {
      var ei = element.id,
          ex = element.g[1],
          ey = element.g[0];
      var cellsAtIndex = this._indexedCells[element.i].cs;

      for (var ci in cellsAtIndex) {
        var cell = cellsAtIndex[ci];
        if (this._elmInsideOperations[this.options.gridMode].call(this, ex, ey, cell)) {
          cell.elms.push(ei);
        }
      }
    }.bind(this));
  },

  _cellIsNotEmpty:function (cell) {
    return cell.elms.length !== 0;
  },

  _getElementsCollection: function (){
    var that = this;
    return Object.keys(this._elements).map(function (key) {
      return {
        id: that._elements[key].id,
        g: that._elements[key].geometry,
        i: that._elements[key].index
      };
    });
  },

  _visualise: function (featureType) {
    var that = this;
    var cj, cell;
    if (this.options.rules[featureType]) {

      Object.keys(this.options.rules[featureType]).map(function (option) {
        var rule = that.options.rules[featureType][option];

        if (option == 'text') {
          that._cellsValues(rule.method, rule.attribute);
          for (cj in that._cells) {
            cell = that._cells[cj];

            if (that._cellIsNotEmpty(cell)) {
              cell.options.texts.text = cell.value;
            }
          }
        } else if (that._isDynamicalRule(rule)) {
          that._cellsValues(rule.method, rule.attribute);
          that._applyOptions(featureType, rule.scale, rule.style, option);
        } else {
          for (cj in that._cells) {
            cell = that._cells[cj];
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
      geometries.push(elements[e].g);
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
    return cellSize/111319;
    // return (cellSize/111319) * this._deltaHeightAtY(y);
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
