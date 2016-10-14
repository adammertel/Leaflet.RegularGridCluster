L.RegularGridClusterCell = L.Polygon.extend({
  options: {
    color: 'white',
    weight: 1,
    fillOpacity: 0.6
  },
  initialize: function (path, options) {
    this.options = L.extend(this.options, options)
    L.Util.setOptions(this, options);

    L.Polygon.prototype.initialize.call(this, path, options);
  },
});

L.regularGridClusterCell = function(options) {
  return new L.RegularGridClusterCell(options);
};
