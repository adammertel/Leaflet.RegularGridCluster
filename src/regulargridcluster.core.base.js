// main class, controller, ...

L.RegularGridCluster = L.FeatureGroup.extend({
  options: {
    gridMode: 'square',
    zoneSize: 10000, // size of the cell at a scale of 10

    gridBoundsPadding: 0.1,
    gridOrigin: 'auto', // SW corner for grid extent. 'auto' for getting this value from data. Useful for more independent datasets 

    showCells: true,
    showMarkers: true,
    showTexts: true,

    paneElementsZ: 1000,
    paneCellsZ: 700,
    paneMarkersZ: 800,
    paneTextsZ: 900,

    zoomShowElements: 10,
    zoomHideGrid: 10,

    indexSize: 12, // ratio for pre-indexing elements in grid

    rules: {},
    trackingTime: false // for developement purposes 
  },

  initialize (options) {
    //this.options = L.extend(this.options, options);
    this.lastelmid = 0;
    this.elementDisplayed = false;
    L.Util.setOptions(this, options);

    this._actions = []; 
    this._elements = {};
    this._displayedElements = L.featureGroup([]);
    this._zones = [];

    this._cells = new L.regularGridClusterCellsGroup({controller: this});
    this._markers = new L.regularGridClusterMarkersGroup({controller: this});
    this._texts = new L.regularGridClusterTextsGroup({controller: this});

    
    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },


  onAdd (map) {
    this._map = map;
    this._addPane('grid-elements-pane', this.options.paneElementsZ);
    this._addPane('grid-markers-pane', this.options.paneMarkersZ);
    this._addPane('grid-cells-pane', this.options.paneCellsZ);
    this._addPane('grid-texts-pane', this.options.paneTextsZ);
    //L.GeoJSON.prototype.onAdd.call(this, map);

    this._cells.addTo(this._map);
    this._markers.addTo(this._map);
    this._texts.addTo(this._map);
  
    this._addAction(() => { this.refresh();}, 'zoomend');
    this._index();
    this.refresh();
  },

  _addPane (paneName, zIndex) {
    this._map.createPane(paneName);
    this._map.getPane(paneName).style.zIndex = zIndex;
  },

  _addAction (callback, type) {
    this._actions.push({callback: callback, type: type});
    this._map.on(type, callback);
  },

  _unregisterActions () {
    this._actions.map (action => {
       this._map.off(action.type, action.callback);
    });
  },

  addLayer (layer) {
    this.addLayers([layer]);
  },

  addLayers (layersArray) {
    layersArray.map ( layer => this._addElement (layer));
    if (this._map) {
      this._index();
      this.refresh();
    }
  },

  unregister () {
    this._unregisterActions();
    this._truncateLayers();
    // this._map.removeLayer(this._cells);
    // this._map.removeLayer(this._markers);
    // this._map.removeLayer(this._texts);
    this._map.removeLayer(this._displayedElements);    
  },

  _addElement (element) {
    // todo - filter non point and group data
    this._elements[this.lastelmid] = {
      "id": this.lastelmid,
      "latlng": element.marker.getLatLng(),
      "properties": element.properties,
      "marker": element.marker
    };

    this.lastelmid++;
    //L.GeoJSON.prototype.addData.call(this, element);
  },

  _index () {
    const times = [];
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
  },

  _getElementsCollection () {
    return Object.keys(this._elements).map( key => {
      return {
        id: this._elements[key].id,
        g: this._elements[key].latlng,
        i: this._elements[key].index
      };
    });
  },

  _getElementMarkers () {
    return Object.keys(this._elements).map( key => {
      return this._elements[key].marker;
    });
  },

  refresh () {
    this._renderComponents();
    this._renderElements();
  },

  _renderElements () {
    if (this._map.getZoom() >= this.options.zoomShowElements) {
      console.log('elements will be displayed');
      this._displayElements();
    } else {
      this._hideElements();
    }
  },

  _displayElements () {
    if (!this.elementDisplayed) {
      this._displayedElements.clearLayers();
      this.elementDisplayed = true;

      this._getElementMarkers().map( marker => {
        marker.setStyle({pane: 'grid-elements-pane'});
        this._displayedElements.addLayer(marker);
      });

      this._displayedElements.addTo(this._map);
    }
  },

  _hideElements () {
    if (this.elementDisplayed) {
      this.elementDisplayed = false;
      this._displayedElements.clearLayers();
    }
  },

  _renderComponents () {
    if (this._map.getZoom() < this.options.zoomHideGrid) {
      console.log('grid components will be displayed');
      this._truncateLayers();

      const times = [];
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
 
  _truncateLayers () {
    this._cells.truncate();
    this._markers.truncate();
    this._texts.truncate();
  },

  _buildCells () {
    if (this.options.rules.cells && this.options.showCells) {
      this._visualise('cells');

      this._zones.forEach(function (zone) {
        if (this._zoneIsNotEmpty(zone)){
          const regularCell = new L.regularGridClusterCell(zone.path, zone.options.cells);
          this._cells.addLayer(regularCell);
        }
      }.bind(this));

      this._cells.addTo(this._map);
    }
  },

  _buildMarkers () {
    if (this.options.rules.markers && this.options.showMarkers) {
      this._visualise('markers');

      this._zones.map(zone => {
        if (this._zoneIsNotEmpty(zone)){
          const zoneCentroid = [zone.y + zone.h/2, zone.x + zone.w/2];
          const marker = new L.regularGridClusterMarker(zoneCentroid, zone.options.markers);
          this._markers.addLayer(marker);
        }
      });

      this._markers.addTo(this._map);
    }
  },

  _buildTexts () {
    if (this.options.rules.texts && this.options.showTexts) {
      this._visualise('texts');

      this._zones.map ( cell => {
        if (this._zoneIsNotEmpty(cell)){
          const cellCentroid = [cell.y + cell.h/2, cell.x + cell.w/2];
          const text = new L.regularGridClusterText(cellCentroid, cell.options.texts);
          this._texts.addLayer(text);
        }
      });

      this._texts.addTo(this._map);
    }
  },

  _indexZones () {
    const origin = this._gridOrigin();
    const gridEnd = this._gridExtent().getNorthEast();
    const maxX = gridEnd.lng, maxY = gridEnd.lat;
    const x = origin.lng, y = origin.lat;

    const indexPortion = this.options.indexSize;
    const diffX = (maxX - x) / indexPortion, diffY = (maxY - y) / indexPortion;
    
    this._indexedZones = {};
    let zoneId = 0;

    for (var xi = x; xi < maxX; xi += diffX){
      for (var yi = y; yi < maxY; yi += diffY){
        const bounds = L.latLngBounds([yi, xi], [yi + diffY, xi + diffX]);
        this._indexedZones[zoneId] = {
          b: bounds,
          cs: []
        };
        zoneId++;
      }
    }
  },

  _indexElements () {
    this._getElementsCollection().map( element => {
      for (const ici in this._indexedZones) {
        if (this._indexedZones[ici].b.contains(element.g)) {
          this._elements[element.id].index = ici;
          break;
        }
      }
    });
  },

  _indexedZonesCollection () {
    return Object.keys(this._indexedZones).map( key => this._indexedZones[key]);
  },

  _truncateIndexedZones () {
    this._indexedZonesCollection().map( indexedZone => {
      indexedZone.cs = [];
    });
  },

  _prepareZones () {
    this._zones = [];
    this._truncateIndexedZones();
    
    let zoneId = 1;

    const zoneSize = this._zoneSize();
    const origin = this._gridOrigin();
    const gridEnd = this._gridExtent().getNorthEast();
    const maxX = gridEnd.lng, maxY = gridEnd.lat;

    let x = origin.lng, y = origin.lat;
    let row = 1;

    const zoneW = zoneSize/111319;
    const indexedZonesCollection = this._indexedZonesCollection();

    const indexZonesInCollection = (zone, zoneBounds) => {
      indexedZonesCollection.map (indexedZone => {
        if (indexedZone.b.overlaps(zoneBounds)){
          indexedZone.cs.push(zone);
        }
      });
    };

    while (y < maxY) {
      const zoneH = this._zoneHeightAtY(y, zoneSize);

      if (this.options.gridMode == 'hexagon' && row % 2) {
        x -= zoneW/2;
      }

      while (x < maxX) {
        const zone = {
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

        const zoneBounds = L.latLngBounds([y, x], [y + zoneH, x + zoneW]);

        zone.path = this._buildPathOperations[this.options.gridMode].call(this, zone);
        this._zones.push(zone);

        indexZonesInCollection(zone, zoneBounds);
        zoneId++;

        x += zoneW;
      }

      x = origin.lng;
      y = this.options.gridMode === 'hexagon' ? y + 3/4 * zoneH : y + zoneH;
      
      row += 1;
    }
  },

  _findElements () {
    this._getElementsCollection().map( element => {
      const ei = element.id;
      const ex = element.g.lng, ey = element.g.lat;

      if (typeof this._indexedZones[element.i] === 'object') {
        this._indexedZones[element.i].cs.map( zone => {
          if (this._elmInsideOperations[this.options.gridMode].call(this, ex, ey, zone)) {
            zone.elms.push(ei);
          }
        });
      }
    });
  },

  _zoneIsNotEmpty (zone) {
    return zone.elms.length !== 0;
  },

  _visualise (featureType) {
    if (this.options.rules[featureType]) {

      Object.keys(this.options.rules[featureType]).map( option => {
        const rule = this.options.rules[featureType][option];

        if (option == 'text') {
          this._zonesValues(rule.method, rule.attribute);
          this._zones.map ( zone => {
            if (this._zoneIsNotEmpty(zone)) {
              zone.options.texts.text = zone.value;
            }
          });

        } else if (this._isDynamicalRule(rule)) {
          this._zonesValues(rule.method, rule.attribute);
          this._applyOptions(featureType, rule.scale, rule.style, option);
        
        } else {
          this._zones.map ( zone => {
            if (this._zoneIsNotEmpty(zone)) {
              zone.options[featureType][option] = rule;
            }
          });
        }
      });
    }
  },

  _applyOptions (featureType, scale, style, option) {
    if (style.length == 1) {
      this._zones.map( zone => {
        zone.options[featureType][option] = style[0];
      });
    } else if (style.length > 1) {
      
      const values = this._zoneValues(true).sort(function(a,b){return a-b;});
      let noInts = style.length;

      if (scale === 'continuous') { noInts = noInts - 1;}
      const max = Math.max(...values);
      const min = Math.min(...values);

      const thresholds = [];

      if (scale != 'size') {
        const qLen = Math.floor(values.length / noInts);

        for (let i = 1; i != noInts; i++ ) {
          thresholds.push(values[qLen * i]);
        }
      }

      if (this._scaleOperations[scale]){
        this._zones.map( zone => {
          if (this._isDefined(zone.value)) {
            zone.options[featureType][option] = this._scaleOperations[scale](
              this, 
              zone.value, 
              min, max, noInts, 
              thresholds, style
            );
          }
        });
      }
    }
  },

  _zonesValues (method, attr) {
    this._zones.map ( zone => {
      if (this._zoneIsNotEmpty(zone)){
        let zoneValues;

        if (method !== 'count') {
          zoneValues = this._zoneAttrValues(zone, attr);
        }
        zone.value = this._methodOperations[method](this, zone, zoneValues);
      }
    });
  },

  _zoneValues (onlyDefined) {
    if (onlyDefined) {
      return this._zones.filter(zone => typeof zone.value !== 'undefined' && !isNaN(zone.value)).map( zone => zone.value);
    } else {
      return this._zones.map( zone => zone.value);
    }
  },

  _zoneAttrValues (zone, attr) {
    return zone.elms.map( elm => this._elements[elm].properties[attr]);
  },

  _isDynamicalRule (rule) {
    return rule.method && rule.scale && rule.style;
  },

  // return size of the zone in meters
  _zoneSize () {
    return this.options.zoneSize * Math.pow(2, 10 - this._mapZoom());
  },

  _gridOrigin () {
    return this.options.gridOrigin === 'auto' ? 
      this._gridExtent().getSouthWest() :
      this.options.gridOrigin;
  },

  _gridExtent () {
    return this._getBounds().pad(this.options.gridBoundsPadding);
  },

  _getBounds () {
    return L.latLngBounds(this._getGeometries());
  },

  _getGeometries () {
    return this._getElementsCollection().map ( element => element.g);
  },

  _mapZoom () {
    return this._map ? this._map.getZoom() : false;
  },

  // BASE FUNCTIONS
  // longitude delta for given latitude
  _zoneHeightAtY (y, zoneSize) {
    console.log('zoneHeighr');
    return zoneSize/111319;
    // return (cellSize/111319) * this._deltaHeightAtY(y);
  },

  _isDefined (value) {
    return !(!value && value !== 0);
  },

  _isNumber (value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
});

L.regularGridCluster = function(options, secondGrid) {
  return new L.RegularGridCluster(options);
};
