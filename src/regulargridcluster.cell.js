L.RegularGridClusterCell = L.Polygon.extend({
  options: {

  },
  initialize: function (options) {
    this.options = L.extend(this.options, options)
    L.Util.setOptions(this, options);

    L.Polygon.prototype.initialize.call(this, {
      features: []
    }, options);
  },
});

L.regularGridClusterCell = function(options) {
  return new L.RegularGridClusterCell(options);
};
