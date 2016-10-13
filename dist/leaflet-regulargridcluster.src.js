L.RegularGridClusterCell = L.Polygon.extend({
    options: {},
    initialize: function(options) {
        this.options = L.extend(this.options, options);
        L.Util.setOptions(this, options);
        L.Polygon.prototype.initialize.call(this, {
            features: []
        }, options);
    }
});

L.regularGridClusterCell = function(options) {
    return new L.RegularGridClusterCell(options);
};

L.RegularGridClusterClusterGroup = L.FeatureGroup.extend({
    options: {},
    initialize: function(options) {
        this.options = L.extend(this.options, options);
        L.Util.setOptions(this, options);
        L.FeatureGroup.prototype.initialize.call(this, {
            features: []
        }, options);
    }
});

L.regularGridClusterClusterGroup = function(options) {
    return new L.RegularGridClusterClusterGroup(options);
};

L.RegularGridClusterClusterMarker = L.Marker.extend({
    options: {},
    initialize: function(options) {
        this.options = L.extend(this.options, options);
        L.Util.setOptions(this, options);
        L.Marker.prototype.initialize.call(this, {
            features: []
        }, options);
    }
});

L.regularGridClusterClusterMarker = function(options) {
    return new L.RegularGridClusterClusterMarker(options);
};

L.RegularGridClusterGrid = L.FeatureGroup.extend({
    options: {},
    initialize: function(options) {
        this.options = L.extend(this.options, options);
        L.Util.setOptions(this, options);
        L.FeatureGroup.prototype.initialize.call(this, {
            features: []
        }, options);
    }
});

L.regularGridClusterGrid = function(options) {
    return new L.RegularGridClusterGrid(options);
};

L.RegularGridCluster = L.FeatureGroup.extend({
    options: {
        originX: 50,
        originY: 10,
        cellH: 100,
        cellW: 100
    },
    initialize: function(options) {
        this.options = L.extend(this.options, options);
        L.Util.setOptions(this, options);
        this.grid = new L.regularGridClusterGrid({});
        L.FeatureGroup.prototype.initialize.call(this, {
            features: []
        }, options);
    }
});

L.regularGridCluster = function(options) {
    return new L.RegularGridCluster(options);
};