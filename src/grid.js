L.RegularGridClusterGrid = L.FeatureGroup.extend({
  options: {
  },
  initialize: function (options) {
    this.controller = options.controller;
    this.cellid = 0;
    this.options = L.extend(this.options, options);
    this.cells = [];
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this, {
      features: []
    }, options);
  },

  render: function (cellSize, origin) {
    
  },

  // addLayer: function (cell) {
  //   L.FeatureGroup.prototype.addLayer.call(this, cell);
  //   cell.inside = this.controller.countInside(cell);
  // },

  truncate: function () {
    this.clearLayers();
  }

});


L.regularGridClusterGrid = function(options) {
  return new L.RegularGridClusterGrid(options);
};
