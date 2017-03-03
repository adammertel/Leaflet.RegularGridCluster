var map;
var maxX = 50, minX = 0, maxY = 49.5, minY = 0;
var noTestData = 1000;
var randomData = [];

var grid

document.addEventListener("DOMContentLoaded", function(event) {

  var colors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00'];
  createRandomData()

  // setting map
  map = L.map('map-content')
  map.fitBounds([[minY, minX], [maxY, maxX]]);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    opacity: .3
  }).addTo(map);

  render()

})

var render = function () {
  if (grid) {
    map.removeLayer(grid)
  }

  // define RegularGridCluster instance
  grid = L.regularGridCluster(
    {
      rules: getRules(),
      showElementsZoom: 5,
      gridMode: 'hexagon'
    }
  );

  grid.addLayers(randomData);
  grid.addTo(map);
}

var createRandomData = function () {
  // putting some random point data
  for (var i=0; i < noTestData; i++) {
    var coordinates = [
      minX + Math.random() * (maxX - minX),
      minY + Math.random() * (maxY - minY)
    ];
    //var circle = L.circleMarker([pointData.y, pointData.x], circleStyle(pointData));

    var marker = L.marker(coordinates);
    var mGeoJSON = marker.toGeoJSON();
    mGeoJSON.properties = {
      a: Math.floor(Math.random() * 20),
      b: Math.floor(Math.random() * 10)
    };

    randomData.push(mGeoJSON);
  };
}

var getRules = function () {
  return {
    "grid": {
      "fillColor": {
        "method": "mean",
        "attribute": "b",
        "scale": "size",
        "style": ["white", "black", "purple"]
      },
      "weight": {
        "method": "count",
        "attribute": "b",
        "scale": "continuous",
        "style": [0.3, 0.4, 0.9]
      },
      "color": 'black',
      "weight": 3,
    },
    "markers": {
      "color": 'black',
      "fillColor": {
        "method": "mean",
        "attribute": "b",
        "scale": "size",
        "style": ["white", "blue"]
      },
      "radius": {
        "method": "mean",
        "attribute": "b",
        "scale": "continuous",
        "style": [5, 30]
      },
    },
    "texts": {
      // "color": {
      //   "method": "count",
      //   "attribute": "",
      //   "scale": "quantile",
      //   "style": ["white", "orange", "red"]
      // },
      "font-size": {
        "method": "count",
        "attribute": "",
        "scale": "continuous",
        "style": [12, 22]
      },
      "text": {
        "method": "count",
        "attribute": ""
      },
      "anchorOffsetX": {
        "method": "count",
        "attribute": "",
        "scale": "continuous",
        "style": [5, 25]
      },
      "anchorOffsetY": {
        "method": "count",
        "attribute": "",
        "scale": "continuous",
        "style": [-15, -30]
      },
    }
  }
} 