/*jshint esversion: 6 */

L.RegularGridClusterGrid = L.FeatureGroup.extend({
  options: {

  },
  initialize (options) {
    this.controller = options.controller;
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },

  render (cellSize, origin) {

  },

  addLayer (cell) {
    L.FeatureGroup.prototype.addLayer.call(this, cell);
  },

  truncate () {
    this.clearLayers();
  }
});

L.regularGridClusterGrid = (options) => {
  return new L.RegularGridClusterGrid(options);
};
