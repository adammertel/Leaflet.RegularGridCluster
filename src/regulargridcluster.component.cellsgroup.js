/*jshint esversion: 6 */

L.RegularGridClusterCellsGroup = L.FeatureGroup.extend({
  options: {
    
  },
  initialize (options) {
    this.controller = options.controller;
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, this.options);
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

L.regularGridClusterCellsGroup = (options) => {
  return new L.RegularGridClusterCellsGroup(options);
};
