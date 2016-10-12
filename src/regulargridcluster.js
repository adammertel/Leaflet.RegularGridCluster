L.RegularGridCluster = L.FeatureGroup.extend({
  options: {
    originX: 50,
    originY: 10,
    cellH: 100,
    cellW: 100
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);
    console.log(this.options)
  }
})
