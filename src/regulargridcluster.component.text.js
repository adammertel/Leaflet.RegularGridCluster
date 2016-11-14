L.RegularGridClusterText = L.Marker.extend({
  options: {
    style: {border: '0px !important'},
  },

  initialize: function (centroid, options) {
    this.options = L.extend(this.options, options);
    L.Util.setOptions(this, options);

    var iconOptions = JSON.stringify(options).substring(1, JSON.stringify(options).length - 2).replace(/,/g, ';').replace(/\"/g, "");
    //console.log(iconOptions);

    options.icon = L.divIcon({
      html: '<span style="' + iconOptions + ' ; text-align: center">T</span>',
      iconSize: [0, 0],
      iconAnchor: [options.anchorOffsetX || -10, options.anchorOffsetY || - 30]
    });
    options.border = '3px solid black';
    //console.log(options);
    L.Marker.prototype.initialize.call(this, centroid, options);
  },

});

L.regularGridClusterText = function(centroid, options) {
  return new L.RegularGridClusterText(centroid, options);
};
