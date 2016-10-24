L.RegularGridClusterMarker = L.Marker.extend({
  options: {

  },
  initialize: function (options) {
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.Marker.prototype.initialize.call(this, {
      features: []
    }, options);
  },
});

L.regularGridClusterMarker = function(options) {
  return new L.RegularGridClusterMarker(options);
};
