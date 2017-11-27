L.RegularGridClusterMarkersGroup = L.FeatureGroup.extend({
  options: {},
  initialize: function(options) {
    this.controller = options.controller;
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(
      this,
      {
        features: []
      },
      options
    );
  },

  render: function(cellSize, origin) {},

  addLayer: function(marker) {
    L.FeatureGroup.prototype.addLayer.call(this, marker);
  },

  truncate: function() {
    this.clearLayers();
  }
});

L.regularGridClusterMarkersGroup = function(options) {
  return new L.RegularGridClusterMarkersGroup(options);
};
