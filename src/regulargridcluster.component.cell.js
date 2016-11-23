L.RegularGridClusterCell = L.Polygon.extend({
  options: {
    weight: 1,
    fillOpacity: 0.6,
    clickable: false,
    color: 'grey',
    lineJoin: 'miter',
    fillRule: 'evenodd',
    strokeLocation: 'inside'
  },
  
  initialize: function (path, options) {
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, this.options);

    L.Polygon.prototype.initialize.call(this, path, this.options);
  },
});

L.regularGridClusterCell = function(path, options) {
  return new L.RegularGridClusterCell(path, options);
};
