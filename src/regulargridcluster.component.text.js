L.RegularGridClusterText = L.Marker.extend({
  options: {
    pane: 'grid-texts-pane',
    interactive: false
  },

  initialize: function (centroid, options) {
    
    // to be able to write every option camelCase
    options['font-size'] = options.fontSize;
    options['font-weight'] = options.fontWeight;

    L.Util.setOptions(this, options);

    const iconOptions = JSON.stringify(options).substring(1, JSON.stringify(options).length - 2).replace(/,/g, ';').replace(/\"/g, "");

    this.options.icon = L.divIcon({
      html: '<span class="regular-grid-text-html" style="' + iconOptions + ' ; text-align: center">' + this.options.text + '</span>',
      iconSize: [0, 0],
      iconAnchor: [options.anchorOffsetX || -10, options.anchorOffsetY || - 30],
      className: 'regular-grid-text-marker'
    });

    L.Marker.prototype.initialize.call(this, centroid, this.options);
  }
});

L.regularGridClusterText = (centroid, options) => {
  return new L.RegularGridClusterText(centroid, options);
};
