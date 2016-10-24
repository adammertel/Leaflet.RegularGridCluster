L.RegularGridClusterMarker = L.CircleMarker.extend({
  options: {
    radius: 10
  },
  initialize: function (centroid, options) {
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    L.CircleMarker.prototype.initialize.call(this, centroid, options);
  },
});

L.regularGridClusterMarker = function(centroid, options) {
  return new L.RegularGridClusterMarker(centroid, options);
};
