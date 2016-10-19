L.RegularGridClusterCell=L.Polygon.extend({options:{weight:1,fillOpacity:.6,clickable:!1,color:"grey"},initialize:function(t,e){this.options=L.extend(this.options,e),L.Util.setOptions(this,this.options),L.Polygon.prototype.initialize.call(this,t,this.options)}}),L.regularGridClusterCell=function(t,e){return new L.RegularGridClusterCell(t,e)},L.RegularGridClusterClusterGroup=L.FeatureGroup.extend({options:{},initialize:function(t){this.controller=t.controller,this.options=L.extend(this.options,t),L.Util.setOptions(this,t),L.FeatureGroup.prototype.initialize.call(this,{features:[]},t)},addLayer:function(t){L.FeatureGroup.prototype.addLayer.call(this,t)},truncate:function(){this.clearLayers()}}),L.regularGridClusterClusterGroup=function(t){return new L.RegularGridClusterClusterGroup(t)},L.RegularGridClusterClusterMarker=L.Marker.extend({options:{},initialize:function(t){this.options=L.extend(this.options,t),L.Util.setOptions(this,t),L.Marker.prototype.initialize.call(this,{features:[]},t)}}),L.regularGridClusterClusterMarker=function(t){return new L.RegularGridClusterClusterMarker(t)},L.RegularGridClusterGrid=L.FeatureGroup.extend({options:{},initialize:function(t){this.controller=t.controller,this.cellid=0,this.options=L.extend(this.options,t),this.cells=[],L.Util.setOptions(this,t),L.FeatureGroup.prototype.initialize.call(this,{features:[]},t)},render:function(t,e){this.visualiseCells(),console.log(t),console.log(e)},createCell:function(t,e){var i=new L.regularGridClusterCell(t,e);return i.cellId=this.cellid,this.addLayer(i),this.cellid++,i},addValueToCell:function(t,e,i){t.options[e]=i},visualiseCells:function(){var t=this.getCells(),e=this.maxInside(t)+1,i=this.options.fillScale.length,r=e/i;for(var l in t){var s=t[l],n=this.options.fillScale[Math.floor(s.inside/r)];s.setStyle({fillColor:n})}},maxInside:function(t){return Math.max.apply(Math,t.map(function(t){return t.inside}))},getCells:function(){return this.getLayers()},truncate:function(){this.clearLayers()}}),L.regularGridClusterGrid=function(t){return new L.RegularGridClusterGrid(t)},L.RegularGridCluster=L.GeoJSON.extend({options:{gridBoundsPadding:.1,gridMode:"square",cellSize:1e4,rules:{},gridFillColor:"white",gridFillOpacity:.05,gridStrokeColor:"grey",gridStrokeWeight:2,gridStrokeOpacity:.4},initialize:function(t){this.options=L.extend(this.options,t),this.lastelmid=0,L.Util.setOptions(this,t),this._elements={},this._cells=[],this._grid=new L.regularGridClusterGrid({controller:this}),this._clusters=new L.regularGridClusterClusterGroup({controller:this}),L.FeatureGroup.prototype.initialize.call(this,{features:[]},t)},onAdd:function(t){var e=this;this._map=t,this._grid.addTo(this._map),this._clusters.addTo(this._map),this._map.on("zoomend",function(){e.refresh(!0,!0)}),this.refresh(!0,!0)},addElement:function(t){this._elements[this.lastelmid]={id:this.lastelmid,geometry:t.geometry.coordinates,properties:t.properties},this.lastelmid++,this._map&&this.refresh(!0,!0)},addData:function(t){},refresh:function(t,e){console.log("refresh"),this._prepareCells(),t&&this._buildGrid(),e&&this._buildClusters()},_visualiseCells:function(){var t=this;Object.keys(this.options.rules.grid).map(function(e){var i=t.options.rules.grid[e];if(t._isDynamicalRule(i)){console.log(i);var r=t._getCellsValues(i.method,i.attribute),l=Math.max.apply(null,r),s=Math.min.apply(null,r),n=i.style.length,o=l-s;for(var a in t._cells){var u=t._cells[a],h=t._getCellValue(u,i.method,i.attribute),c=t._getCellInterval(h,s,l,o,n,i.scale);u.options[e]=i.style[c]}console.log(t._cells)}else for(var d in t._cells)t._cells[d].options[e]=i})},_getCellValue:function(t,e,i){switch(e){case"count":return t.elms.length;default:return t.elms.length}},_getCellInterval:function(t,e,i,r,l,s){switch(s){case"size":return t==i?l-1:Math.floor((t-e)/r*l);default:return t==i?l-1:Math.floor((t-e)/r*l)}},_getCellsValues:function(t,e){var i=[];switch(t){case"count":for(var r in this._cells){var l=this._cells[r];i.push(l.elms.length)}return i}},_isDynamicalRule:function(t){return t.method&&t.scale&&t.style},_buildGrid:function(){this._truncateGrid(),this._visualiseCells();for(var t in this._cells){var e=this._cells[t],i=new L.regularGridClusterCell(e.path,e.options);this._grid.addLayer(i)}this._grid.addTo(this._map)},_truncateGrid:function(){this._grid.truncate()},_buildClusters:function(){this._truncateClusters()},_prepareCells:function(){this._cells=[];for(var t=1,e=this._cellSize(),i=this._gridOrigin(),r=this._gridExtent().getNorthEast(),l=r.lng,s=r.lat,n=i.lng,o=i.lat,a=e/111319;o<s;){for(var u=this._cellHeightAtY(o,e);n<l;){var h={id:t,x:n,y:o,h:u,w:a,options:{}};h.path=this._cellPath(h),h.elms=this._cellElmsInside(h),this._cells.push(h),t++,n+=a}n=i.lng,o+=u}console.log("created "+this._cells.length+" cells")},_cellPath:function(t){var e=t;switch(this.options.gridMode){case"square":return[[e.y,e.x],[e.y,e.x+e.w],[e.y+e.h,e.x+e.w],[e.y+e.h,e.x],[e.y,e.x]];default:return[[e.y,e.x],[e.y,e.x+e.w],[e.y+e.h,e.x+e.w],[e.y+e.h,e.x],[e.y,e.x]]}},_cellElmsInside:function(t){switch(this.options.gridMode){case"square":return this._elmsInsideSquare(t);default:return this._elmsInsideSquare(t)}},_elmsInsideSquare:function(t){var e=[],i=new L.latLngBounds(L.latLng(t.y,t.x),L.latLng(t.y+t.h,t.x+t.w)),r=this._getElementsCollection();for(var l in r){var s=r[l];i.contains(s.geometry)&&e.push(s.id)}return e},_getElementsCollection:function(){var t=this;return Object.keys(this._elements).map(function(e){return t._elements[e]})},_createCell:function(t,e){return this._grid.createCell(t,e)},_truncateClusters:function(){this._clusters.truncate()},_cellSize:function(){return this.options.cellSize*Math.pow(2,10-this._mapZoom())},_gridOrigin:function(){return this._gridExtent().getSouthWest()},_gridExtent:function(){return this._getBounds().pad(this.options.gridBoundsPadding)},_getBounds:function(){var t=this._getGeometries();return L.latLngBounds(t)},_getGeometries:function(){var t=[],e=this._getElementsCollection();for(var i in e)t.push(e[i].geometry);return t},_mapZoom:function(){return!!this._map&&this._map.getZoom()},_calculateGridOrigin:function(){},_cellHeightAtY:function(t,e){return e/111319*this._deltaHeightAtY(t)},_deltaHeightAtY:function(t){return Math.abs(1/Math.cos(t*Math.PI/180))}}),L.regularGridCluster=function(t){return new L.RegularGridCluster(t)};