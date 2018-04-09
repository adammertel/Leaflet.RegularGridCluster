/*
  regular-grid-cluster plugin for leaflet
  https://github.com/adammertel/Leaflet.RegularGridCluster
  Adam Mertel | univie
*/

'use strict';

L.RegularGridClusterCell = L.Polygon.extend({
  options: {
    weight: 1,
    fillOpacity: 0.6,
    clickable: false,
    color: 'grey',
    lineJoin: 'miter',
    fillRule: 'evenodd',
    strokeLocation: 'inside',
    pane: 'grid-cells-pane',
    interactive: false
  },

  initialize: function initialize(path, options) {
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, this.options);

    L.Polygon.prototype.initialize.call(this, path, this.options);
  }
});

L.regularGridClusterCell = function (path, options) {
  return new L.RegularGridClusterCell(path, options);
};
"use strict";

L.RegularGridClusterCellsGroup = L.FeatureGroup.extend({
  options: {
    interactive: false
  },
  initialize: function initialize(options) {
    this.controller = options.controller;
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, this.options);
  },
  render: function render(cellSize, origin) {},
  addLayer: function addLayer(cell) {
    L.FeatureGroup.prototype.addLayer.call(this, cell);
  },
  truncate: function truncate() {
    this.clearLayers();
  }
});

L.regularGridClusterCellsGroup = function (options) {
  return new L.RegularGridClusterCellsGroup(options);
};
'use strict';

L.RegularGridClusterMarker = L.CircleMarker.extend({
  options: {
    pane: 'grid-markers-pane',
    interactive: false
  },
  initialize: function initialize(centroid, options) {
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.CircleMarker.prototype.initialize.call(this, centroid, this.options);
  }
});

L.regularGridClusterMarker = function (centroid, options) {
  return new L.RegularGridClusterMarker(centroid, options);
};
"use strict";

L.RegularGridClusterMarkersGroup = L.FeatureGroup.extend({
  options: {},
  initialize: function initialize(options) {
    this.controller = options.controller;
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },

  render: function render(cellSize, origin) {},

  addLayer: function addLayer(marker) {
    L.FeatureGroup.prototype.addLayer.call(this, marker);
  },

  truncate: function truncate() {
    this.clearLayers();
  }
});

L.regularGridClusterMarkersGroup = function (options) {
  return new L.RegularGridClusterMarkersGroup(options);
};
'use strict';

L.RegularGridClusterText = L.Marker.extend({
  options: {
    pane: 'grid-texts-pane',
    interactive: false
  },

  initialize: function initialize(centroid, options) {
    // to be able to write every option camelCase
    options['font-size'] = options.fontSize;
    options['font-weight'] = options.fontWeight;

    L.Util.setOptions(this, options);

    var iconOptions = JSON.stringify(options).substring(1, JSON.stringify(options).length - 2).replace(/,/g, ';').replace(/\"/g, '');

    this.options.icon = L.divIcon({
      html: '<span class="regular-grid-text-html" style="' + iconOptions + ' ; text-align: center">' + this.options.text + '</span>',
      iconSize: [0, 0],
      iconAnchor: [options.anchorOffsetX || -10, options.anchorOffsetY || -30],
      className: 'regular-grid-text-marker'
    });

    L.Marker.prototype.initialize.call(this, centroid, this.options);
  }
});

L.regularGridClusterText = function (centroid, options) {
  return new L.RegularGridClusterText(centroid, options);
};
"use strict";

L.RegularGridClusterTextsGroup = L.FeatureGroup.extend({
  options: {},
  initialize: function initialize(options) {
    this.controller = options.controller;
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },
  render: function render(cellSize, origin) {},
  addLayer: function addLayer(marker) {
    L.FeatureGroup.prototype.addLayer.call(this, marker);
  },
  truncate: function truncate() {
    this.clearLayers();
  }
});

L.regularGridClusterTextsGroup = function (options) {
  return new L.RegularGridClusterTextsGroup(options);
};
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// main class, controller, ...

L.RegularGridCluster = L.FeatureGroup.extend({
  options: {
    gridMode: 'square', // square of hexagon
    zoneSize: 10000, // size of the cell at a scale of 10

    gridOrigin: 'auto', // SW corner for grid extent. 'auto' for getting this value from data. Useful for more independent datasets
    gridEnd: 'auto',
    gridBoundsPadding: 0.1, // ratio to extend bounding box of elements

    // turning components on and off
    showCells: true,
    showMarkers: true,
    showTexts: true,

    defaultStyle: {
      cells: {},
      texts: {},
      markers: {}
    },

    showEmptyCells: false,
    emptyCellOptions: {
      weight: 1,
      fillOpacity: 0,
      clickable: false,
      color: 'grey',
      lineJoin: 'miter',
      fillRule: 'evenodd',
      strokeLocation: 'inside',
      interactive: false
    },

    // setting z-indices for data layers
    paneElementsZ: 1000,
    paneCellsZ: 700,
    paneMarkersZ: 800,
    paneTextsZ: 900,

    // levels of zoom when to turn grid off and elements on
    zoomShowElements: 10,
    zoomHideGrid: 10,

    indexSize: 12, // ratio for pre-indexing elements in grid

    // set of dynamical and static visual rules that define markers, cells and texts
    rules: {
      cells: {},
      markers: {},
      texts: {}
    },

    trackingTime: false // for developement purposes only
  },

  initialize: function initialize(options) {
    //this.options = L.extend(this.options, options);
    this.lastelmid = 0;
    this.elementDisplayed = false;
    L.Util.setOptions(this, options);

    this._actions = [];
    this._elements = {};
    this._displayedElements = L.featureGroup([]);
    this._zones = [];

    this._cells = new L.regularGridClusterCellsGroup({ controller: this });
    this._markers = new L.regularGridClusterMarkersGroup({ controller: this });
    this._texts = new L.regularGridClusterTextsGroup({ controller: this });

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },
  onAdd: function onAdd(map) {
    var _this = this;

    this._map = map;
    this._addPane('grid-elements-pane', this.options.paneElementsZ);
    this._addPane('grid-markers-pane', this.options.paneMarkersZ);
    this._addPane('grid-cells-pane', this.options.paneCellsZ);
    this._addPane('grid-texts-pane', this.options.paneTextsZ);
    //L.GeoJSON.prototype.onAdd.call(this, map);

    this._cells.addTo(this._map);
    this._markers.addTo(this._map);
    this._texts.addTo(this._map);

    this._addAction(function () {
      _this.refresh();
    }, 'zoomend');
    this._index();
    this.refresh();
  },
  _addPane: function _addPane(paneName, zIndex) {
    if (!map.getPane(paneName)) {
      this._map.createPane(paneName);
      this._map.getPane(paneName).style.zIndex = zIndex;
    }
  },
  _elementCollectionNotEmpty: function _elementCollectionNotEmpty() {
    return Object.keys(this._elements).length !== 0;
  },
  _addAction: function _addAction(callback, type) {
    this._actions.push({ callback: callback, type: type });
    this._map.on(type, callback);
  },
  _unregisterActions: function _unregisterActions() {
    var _this2 = this;

    this._actions.map(function (action) {
      if (_this2._map.off) _this2._map.off(action.type, action.callback);
    });
  },
  addLayer: function addLayer(layer) {
    this.addLayers([layer]);
  },
  addLayers: function addLayers(layersArray) {
    var _this3 = this;

    layersArray.map(function (layer) {
      return _this3._addElement(layer);
    });
    if (this._map) {
      this._index();
      this.refresh();
    }
  },
  _removePanes: function _removePanes() {
    var _this4 = this;

    var panes = ['grid-elements-pane', 'grid-markers-pane', 'grid-cells-pane', 'grid-texts-pane'];
    panes.map(function (pane) {
      _this4._map.getPane(pane).remove();

      //paneElement.parentNode.removeChild(paneElement);
    });
  },
  unregister: function unregister() {
    this._unregisterActions();
    // this._removePanes();
    this._truncateLayers();
    this._cells.remove();
    this._markers.remove();
    this._texts.remove();
    // this._map.removeLayer(this._cells);
    // this._map.removeLayer(this._markers);
    // this._map.removeLayer(this._texts);
    this._map.removeLayer(this._displayedElements);
  },
  _addElement: function _addElement(element) {
    // todo - filter non point and group data
    this._elements[this.lastelmid] = {
      id: this.lastelmid,
      latlng: element.marker.getLatLng(),
      properties: element.properties,
      marker: element.marker
    };

    this.lastelmid++;
    //L.GeoJSON.prototype.addData.call(this, element);
  },
  _index: function _index() {
    if (this._elementCollectionNotEmpty()) {
      var times = [];
      times.push(new Date());
      this._indexZones();
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
    }
  },
  _getElementsCollection: function _getElementsCollection() {
    var _this5 = this;

    return Object.keys(this._elements).map(function (key) {
      return {
        id: _this5._elements[key].id,
        g: _this5._elements[key].latlng,
        i: _this5._elements[key].index
      };
    });
  },
  _getElementMarkers: function _getElementMarkers() {
    var _this6 = this;

    return Object.keys(this._elements).map(function (key) {
      return _this6._elements[key].marker;
    });
  },
  refresh: function refresh() {
    if (this._elementCollectionNotEmpty()) {
      this._renderComponents();
      this._renderElements();
    }
  },
  _renderElements: function _renderElements() {
    if (this._map.getZoom() >= this.options.zoomShowElements) {
      console.log('elements will be displayed');
      this._displayElements();
    } else {
      this._hideElements();
    }
  },
  _displayElements: function _displayElements() {
    var _this7 = this;

    if (!this.elementDisplayed) {
      this._displayedElements.clearLayers();
      this.elementDisplayed = true;

      this._getElementMarkers().map(function (marker) {
        marker.setStyle({ pane: 'grid-elements-pane' });
        _this7._displayedElements.addLayer(marker);
      });

      this._displayedElements.addTo(this._map);
    }
  },
  _hideElements: function _hideElements() {
    if (this.elementDisplayed) {
      this.elementDisplayed = false;
      this._displayedElements.clearLayers();
    }
  },
  _renderComponents: function _renderComponents() {
    if (this._map.getZoom() < this.options.zoomHideGrid) {
      console.log('grid components will be displayed');
      this._truncateLayers();

      var times = [];
      times.push(new Date());

      this._prepareZones();
      times.push(new Date());

      this._findElements();
      times.push(new Date());

      this._buildCells();
      times.push(new Date());

      this._buildMarkers();
      times.push(new Date());

      this._buildTexts();
      times.push(new Date());

      if (this.options.trackingTime) {
        console.log('********************');
        console.log('cells prepared in ' + (times[1].valueOf() - times[0].valueOf()) + 'ms');
        console.log('elements found in ' + (times[2].valueOf() - times[1].valueOf()) + 'ms');
        console.log('cells built in     ' + (times[3].valueOf() - times[2].valueOf()) + 'ms');
        console.log('markers built in  ' + (times[4].valueOf() - times[3].valueOf()) + 'ms');
        console.log('texts built in    ' + (times[5].valueOf() - times[4].valueOf()) + 'ms');
        console.log(this._zones.length + ' cells refreshed in ' + (times[5].valueOf() - times[0].valueOf()) + 'ms');
        console.log('********************');
      }
    } else {
      console.log('grid will be hidden');
      this._truncateLayers();
    }
  },
  _truncateLayers: function _truncateLayers() {
    this._cells.truncate();
    this._markers.truncate();
    this._texts.truncate();
  },
  _buildCells: function _buildCells() {
    var _this8 = this;

    if (this.options.rules.cells && this.options.showCells) {
      this._visualise('cells');

      this._zones.filter(function (zone) {
        return _this8.options.showEmptyCells || _this8._zoneIsNotEmpty(zone);
      }).map(function (zone) {
        var options = zone.options.cells;

        if (_this8.options.showEmptyCells) {
          if (!_this8._zoneIsNotEmpty(zone)) {
            options = _this8.options.emptyCellOptions;
          }
        }

        var regularCell = new L.regularGridClusterCell(zone.path, options);
        _this8._cells.addLayer(regularCell);
      });

      this._cells.addTo(this._map);
    }
  },
  _buildMarkers: function _buildMarkers() {
    var _this9 = this;

    if (this.options.rules.markers && this.options.showMarkers) {
      this._visualise('markers');

      this._zones.map(function (zone) {
        if (_this9._zoneIsNotEmpty(zone)) {
          var zoneCentroid = [zone.y + zone.h / 2, zone.x + zone.w / 2];
          var marker = new L.regularGridClusterMarker(zoneCentroid, zone.options.markers);
          _this9._markers.addLayer(marker);
        }
      });

      this._markers.addTo(this._map);
    }
  },
  _buildTexts: function _buildTexts() {
    var _this10 = this;

    if (this.options.rules.texts && this.options.showTexts) {
      this._visualise('texts');

      this._zones.map(function (cell) {
        if (_this10._zoneIsNotEmpty(cell)) {
          var cellCentroid = [cell.y + cell.h / 2, cell.x + cell.w / 2];
          var text = new L.regularGridClusterText(cellCentroid, cell.options.texts);
          _this10._texts.addLayer(text);
        }
      });

      this._texts.addTo(this._map);
    }
  },
  _indexZones: function _indexZones() {
    var origin = this._gridOrigin();
    var gridEnd = this._gridEnd();
    // const gridEnd = this._gridExtent().getNorthEast();
    var maxX = gridEnd.lng,
        maxY = gridEnd.lat;
    var x = origin.lng,
        y = origin.lat;

    var indexPortion = this.options.indexSize;
    var diffX = (maxX - x) / indexPortion,
        diffY = (maxY - y) / indexPortion;

    this._indexedZones = {};
    var zoneId = 0;

    for (var xi = x; xi < maxX; xi += diffX) {
      for (var yi = y; yi < maxY; yi += diffY) {
        var bounds = L.latLngBounds([yi, xi], [yi + diffY, xi + diffX]);
        this._indexedZones[zoneId] = {
          b: bounds,
          cs: []
        };
        zoneId++;
      }
    }
  },
  _indexElements: function _indexElements() {
    var _this11 = this;

    this._getElementsCollection().map(function (element) {
      for (var ici in _this11._indexedZones) {
        if (_this11._indexedZones[ici].b.contains(element.g)) {
          _this11._elements[element.id].index = ici;
          break;
        }
      }
    });
  },
  _indexedZonesCollection: function _indexedZonesCollection() {
    var _this12 = this;

    return Object.keys(this._indexedZones).map(function (key) {
      return _this12._indexedZones[key];
    });
  },
  _truncateIndexedZones: function _truncateIndexedZones() {
    this._indexedZonesCollection().map(function (indexedZone) {
      indexedZone.cs = [];
    });
  },
  _prepareZones: function _prepareZones() {
    this._zones = [];
    this._truncateIndexedZones();

    var zoneId = 1;

    var zoneSize = this._zoneSize();
    var origin = this._gridOrigin();
    var gridEnd = this._gridEnd();
    var maxX = gridEnd.lng,
        maxY = gridEnd.lat;

    var x = origin.lng,
        y = origin.lat;
    var row = 1;

    var zoneW = zoneSize / 111319;
    var indexedZonesCollection = this._indexedZonesCollection();

    var indexZonesInCollection = function indexZonesInCollection(zone, zoneBounds) {
      indexedZonesCollection.map(function (indexedZone) {
        if (indexedZone.b.overlaps(zoneBounds)) {
          indexedZone.cs.push(zone);
        }
      });
    };

    while (y < maxY) {
      var zoneH = this._zoneHeightAtY(y, zoneSize);

      if (this.options.gridMode === 'hexagon' && row % 2) {
        x -= zoneW / 2;
      }

      while (x < maxX) {
        var zone = {
          id: zoneId,
          x: x,
          y: y,
          h: zoneH,
          w: zoneW,

          options: {
            cells: {},
            markers: {},
            texts: {}
          },

          elms: []
        };

        var zoneBounds = L.latLngBounds([y, x], [y + zoneH, x + zoneW]);

        zone.path = this._buildPathOperations[this.options.gridMode].call(this, zone);
        this._zones.push(zone);

        indexZonesInCollection(zone, zoneBounds);
        zoneId++;

        x += zoneW;
      }

      x = origin.lng;
      y = this.options.gridMode === 'hexagon' ? y + 3 / 4 * zoneH : y + zoneH;

      row += 1;
    }
  },
  _findElements: function _findElements() {
    var _this13 = this;

    this._getElementsCollection().map(function (element) {
      var ei = element.id;
      var ex = element.g.lng,
          ey = element.g.lat;

      if (_typeof(_this13._indexedZones[element.i]) === 'object') {
        _this13._indexedZones[element.i].cs.map(function (zone) {
          if (_this13._elmInsideOperations[_this13.options.gridMode].call(_this13, ex, ey, zone)) {
            zone.elms.push(ei);
          }
        });
      }
    });
  },
  _zoneIsNotEmpty: function _zoneIsNotEmpty(zone) {
    return zone.elms.length !== 0;
  },
  _visualise: function _visualise(featureType) {
    var _this14 = this;

    if (this.options.rules[featureType]) {
      Object.keys(this.options.rules[featureType]).forEach(function (option) {
        var rule = _this14.options.rules[featureType][option];

        if (option === 'text') {
          _this14._zonesValues(rule.method, rule.attribute);
          _this14._zones.forEach(function (zone) {
            if (_this14._zoneIsNotEmpty(zone)) {
              zone.options.texts.text = zone.value;
            }
          });
        } else if (_this14._isDynamicalRule(rule)) {
          _this14._zonesValues(rule.method, rule.attribute);
          _this14._applyOptions(featureType, rule, option);
        } else {
          _this14._zones.forEach(function (zone) {
            if (_this14._zoneIsNotEmpty(zone)) {
              zone.options[featureType][option] = rule;
            }
          });
        }
      });
    }
  },
  _applyOptions: function _applyOptions(featureType, rule, option) {
    var _this15 = this;

    var scale = rule.scale;
    var range = rule.range;

    if (range.length === 1) {
      this._zones.forEach(function (zone) {
        zone.options[featureType][option] = range[0];
      });
    } else if (range.length > 1) {
      var values = this._zoneValues(true).sort(function (a, b) {
        return a - b;
      });

      var noInts = range.length;

      if (scale === 'continuous') {
        noInts = noInts - 1;
      }
      var min = rule.domain ? rule.domain[0] : Math.min.apply(Math, _toConsumableArray(values));
      var max = rule.domain ? rule.domain[1] : Math.max.apply(Math, _toConsumableArray(values));

      var thresholds = [];

      if (scale != 'size') {
        var qLen = Math.floor(values.length / noInts);

        for (var i = 1; i != noInts; i++) {
          thresholds.push(values[qLen * i]);
        }
      }

      if (this._scaleOperations[scale]) {
        this._zones.forEach(function (zone) {
          if (_this15._isDefined(zone.value)) {
            zone.options[featureType][option] = _this15._scaleOperations[scale](_this15, zone.value, min, max, noInts, thresholds, range);
          } else {
            if (_this15.options.defaultStyle[featureType] && _this15.options.defaultStyle[featureType][option]) {
              zone.options[featureType][option] = _this15.options.defaultStyle[featureType][option];
            } else {
              zone.options[featureType][option] = 'none';
            }
          }
        });
      }
    }
  },
  _zonesValues: function _zonesValues(method, attr) {
    var _this16 = this;

    this._zones.forEach(function (zone) {
      if (_this16._zoneIsNotEmpty(zone)) {
        if (method === 'count') {
          zone.value = _this16._methodOperations[method](_this16, zone, false);
        } else {
          var zoneValues = _this16._zoneAttrValues(zone, attr);
          zone.value = zoneValues.length ? _this16._methodOperations[method](_this16, zone, zoneValues) : false;
        }
      }
    });
  },
  _zoneValues: function _zoneValues(onlyDefined) {
    if (onlyDefined) {
      return this._zones.filter(function (zone) {
        return zone.value && typeof zone.value !== 'undefined' && !isNaN(zone.value);
      }).map(function (zone) {
        return zone.value;
      });
    } else {
      return this._zones.map(function (zone) {
        return zone.value;
      });
    }
  },
  _zoneAttrValues: function _zoneAttrValues(zone, attr) {
    var _this17 = this;

    var values = zone.elms.map(function (elm) {
      return _this17._elements[elm].properties[attr];
    });
    return this._cleanAttrValues(values);
  },
  _cleanAttrValues: function _cleanAttrValues(values) {
    return values.filter(this._isNumber);
  },
  _isDynamicalRule: function _isDynamicalRule(rule) {
    return rule.method && rule.scale && rule.range;
  },


  // return size of the zone in meters
  _zoneSize: function _zoneSize() {
    return this.options.zoneSize * Math.pow(2, 10 - this._mapZoom());
  },
  _gridOrigin: function _gridOrigin() {
    return this.options.gridOrigin === 'auto' ? this._gridExtent().getSouthWest() : this.options.gridOrigin;
  },
  _gridEnd: function _gridEnd() {
    return this.options.gridEnd === 'auto' ? this._gridExtent().getNorthEast() : this.options.gridEnd;
  },
  _gridExtent: function _gridExtent() {
    return this._getBounds().pad(this.options.gridBoundsPadding);
  },
  _getBounds: function _getBounds() {
    return L.latLngBounds(this._getGeometries());
  },
  _getGeometries: function _getGeometries() {
    return this._getElementsCollection().map(function (element) {
      return element.g;
    });
  },
  _mapZoom: function _mapZoom() {
    return this._map ? this._map.getZoom() : false;
  },


  // BASE FUNCTIONS
  // longitude delta for given latitude
  _zoneHeightAtY: function _zoneHeightAtY(y, zoneSize) {
    return zoneSize / 111319;
    // return (cellSize/111319) * this._deltaHeightAtY(y);
  },
  _isDefined: function _isDefined(value) {
    return !(!value && value !== 0);
  },
  _isNumber: function _isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
});

L.regularGridCluster = function (options, secondGrid) {
  return new L.RegularGridCluster(options);
};
'use strict';

L.RegularGridCluster.include({
  // COLORS
  colors: {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    'indianred ': '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgrey: '#d3d3d3',
    lightgreen: '#90ee90',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370d8',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#d87093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32'
  },

  _colorNameToHex: function _colorNameToHex(color) {
    if (typeof this.colors[color.toLowerCase()] != 'undefined') {
      return this.colors[color.toLowerCase()].substring(1);
    } else {
      return false;
    }
  },
  _hex: function _hex(x) {
    x = x.toString(16);
    return x.length == 1 ? '0' + x : x;
  },
  _validateColor: function _validateColor(color) {
    if (color.indexOf('#') == -1) {
      return this._colorNameToHex(color);
    } else {
      return color.substring(1);
    }
  },
  _colorMix: function _colorMix(color1, color2, ratio) {
    color1 = this._validateColor(color1);
    color2 = this._validateColor(color2);

    var r = Math.floor(parseInt(color1.substring(0, 2), 16) * ratio + parseInt(color2.substring(0, 2), 16) * (1 - ratio));
    var g = Math.floor(parseInt(color1.substring(2, 4), 16) * ratio + parseInt(color2.substring(2, 4), 16) * (1 - ratio));
    var b = Math.floor(parseInt(color1.substring(4, 6), 16) * ratio + parseInt(color2.substring(4, 6), 16) * (1 - ratio));

    return '#' + this._hex(r) + this._hex(g) + this._hex(b);
  }
});
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

L.RegularGridCluster.include({
  _math_max: function _math_max(arr) {
    return Math.max.apply(Math, _toConsumableArray(arr));
  },
  _math_min: function _math_min(arr) {
    return Math.min.apply(Math, _toConsumableArray(arr));
  },
  _math_mode: function _math_mode(arr) {
    if (arr.length === 0) {
      return null;
    }
    var modeMap = {};
    var maxEl = arr[0],
        maxCount = 1;

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
        // extendable to solve ties
      }
    }
    return maxEl;
  },
  _math_mean: function _math_mean(arr) {
    return arr.reduce(function (a, b) {
      return a + b;
    }, 0) / arr.length;
  },
  _math_sum: function _math_sum(arr) {
    return arr.reduce(function (a, b) {
      return a + b;
    }, 0);
  },
  _math_median: function _math_median(arr) {
    arr.sort(function (a, b) {
      return a - b;
    });
    var half = Math.floor(arr.length / 2);

    return arr.length % 2 ? arr[half] : (arr[half - 1] + arr[half]) / 2.0;
  }
});
"use strict";

L.RegularGridCluster.include({
  _scaleOperations: {
    size: function size(cluster, value, min, max, noInts, thresholds, range) {
      var diff = max - min;
      var interval = noInts - 1;
      if (value < max) {
        interval = Math.floor((value - min) / diff * noInts);
      }
      return range[interval];
    },

    quantile: function quantile(cluster, value, min, max, noInts, thresholds, range) {
      var interval = 0;
      thresholds.forEach(function (threshold, ti) {
        if (value > threshold) {
          interval = parseInt(ti) + 1;
        }
      });
      return range[interval];
    },

    continuous: function continuous(cluster, value, min, max, noInts, thresholds, range) {
      var interval = 0;

      thresholds.forEach(function (threshold, ti) {
        if (value > threshold) {
          interval = parseInt(ti) + 1;
        }
      });

      var edgeValues = thresholds.slice(0);
      edgeValues.push(max);
      edgeValues.unshift(min);

      var ratioDif = (value - edgeValues[interval]) / (edgeValues[interval + 1] - edgeValues[interval]);
      var bottomValue = range[interval];
      var upperValue = range[interval + 1];

      if (cluster._isNumber(bottomValue)) {
        return bottomValue + ratioDif * (upperValue - bottomValue);
      } else {
        return cluster._colorMix(upperValue, bottomValue, ratioDif);
      }
    }
  },

  _methodOperations: {
    count: function count(cluster, zone, values) {
      return zone.elms.length;
    },
    mean: function mean(cluster, zone, values) {
      return cluster._math_mean(values);
    },
    median: function median(cluster, zone, values) {
      return cluster._math_median(values);
    },
    mode: function mode(cluster, zone, values) {
      return cluster._math_mode(values);
    },
    max: function max(cluster, zone, values) {
      return cluster._math_max(values);
    },
    min: function min(cluster, zone, values) {
      return cluster._math_min(values);
    },
    sum: function sum(cluster, zone, values) {
      return cluster._math_sum(values);
    }
  },

  _elmInsideOperations: {
    square: function square(ex, ey, zone) {
      var x1 = zone.x,
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
    hexagon: function hexagon(ex, ey, zone) {
      var x1 = zone.x,
          x2 = zone.x + zone.w,
          y1 = zone.y,
          y2 = zone.y + zone.h;
      if (ex > x1) {
        if (ey > y1) {
          if (ex < x2) {
            if (ey < y2) {
              var yh1 = y1 + zone.h * 1 / 4,
                  yh2 = y1 + zone.h * 3 / 4;
              if (ey > yh1 && ey < yh2) {
                return true;
              } else {
                var tx = ex - x1,
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
    square: function square(c) {
      return [[c.y, c.x], [c.y, c.x + c.w], [c.y + c.h, c.x + c.w], [c.y + c.h, c.x], [c.y, c.x]];
    },
    hexagon: function hexagon(c) {
      return [[c.y + c.h / 4, c.x], [c.y, c.x + c.w / 2], [c.y + c.h / 4, c.x + c.w], [c.y + 3 * (c.h / 4), c.x + c.w], [c.y + c.h, c.x + c.w / 2], [c.y + 3 * (c.h / 4), c.x], [c.y + c.h / 4, c.x]];
    }
  }
});
