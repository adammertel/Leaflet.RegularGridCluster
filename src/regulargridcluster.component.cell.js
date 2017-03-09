/*jshint esversion: 6 */

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
  
  initialize (path, options) {
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, this.options);

    L.Polygon.prototype.initialize.call(this, path, this.options);
  }
});

L.regularGridClusterCell = (path, options) => {
  return new L.RegularGridClusterCell(path, options);
};
