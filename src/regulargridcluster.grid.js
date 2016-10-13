L.RegularGridClusterGrid = L.FeatureGroup.extend({
  options: {

  },
  initialize: function (options) {
    this.options = L.extend(this.options, options)
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },
});

L.regularGridClusterGrid = function(options) {
  return new L.RegularGridClusterGrid(options);
};
