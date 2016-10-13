L.RegularGridClusterClusterGroup = L.FeatureGroup.extend({
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

L.regularGridClusterClusterGroup = function(options) {
  return new L.RegularGridClusterClusterGroup(options);
};
