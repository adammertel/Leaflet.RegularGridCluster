/*jshint esversion: 6 */

L.RegularGridClusterTextsGroup = L.FeatureGroup.extend({
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

  addLayer (marker) {
    L.FeatureGroup.prototype.addLayer.call(this, marker);
  },

  truncate () {
    this.clearLayers();
  }
});

L.regularGridClusterTextsGroup = (options) => {
  return new L.RegularGridClusterTextsGroup(options);
};
