L.RegularGridCluster = L.FeatureGroup.extend({
  options: {
    originX: 50,
    originY: 10,
    cellH: 100,
    cellW: 100
  },
  initialize: function (options) {
    this.options = L.extend(this.options, options)
    L.Util.setOptions(this, options);

    this.grid = new L.regularGridClusterGrid({});

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },
});

L.regularGridCluster = function(options) {
  return new L.RegularGridCluster(options);
};
