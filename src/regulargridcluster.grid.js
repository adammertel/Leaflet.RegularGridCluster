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
    this.visualiseCells();
    console.log(cellSize);
    console.log(origin);
  },

  // addLayer: function (cell) {
  //   L.FeatureGroup.prototype.addLayer.call(this, cell);
  //   cell.inside = this.controller.countInside(cell);
  // },

  createCell: function (path, options) {
    var newCell = new L.regularGridClusterCell(path, options);
    newCell.cellId = this.cellid;
    this.addLayer(newCell);
    this.cellid++;
    return newCell;
  },

  addValueToCell: function (cell, attrName, value) {
    cell.options[attrName] = value;
  },

  visualiseCells: function () {
    var cells = this.getCells();
    var maxInside = this.maxInside(cells) + 1;

    var intervals = this.options.fillScale.length;
    var d = maxInside / intervals;
    for (var c in cells){
      var cell = cells[c];
      var cellColor = this.options.fillScale[Math.floor((cell.inside)/ d)];
      cell.setStyle({'fillColor': cellColor});
    }
  },

  maxInside: function (cells) {
    return Math.max.apply(Math, cells.map(
      function(o){
        //console.log(o.options);
        return o.inside;
      }
    ));
  },

  getCells: function () {
    return this.getLayers();
  },

  truncate: function () {
    this.clearLayers();
  }


});


L.regularGridClusterGrid = function(options) {
  return new L.RegularGridClusterGrid(options);
};
