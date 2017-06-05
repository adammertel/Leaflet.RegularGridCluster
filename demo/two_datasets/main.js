var map;
var maxX = 50, minX = 0, maxY = 49.5, minY = 0;
var noTestData = 1000;
var gridMarkers = {}

document.addEventListener("DOMContentLoaded", function(event) {
  console.log('dom loaded')

  const randomDataCells = createRandomData('cells');
  const randomDataMarkers = createRandomData('markers');

  // setting map
  map = L.map('map-content');
  map.fitBounds([[minY, minX], [maxY, maxX]]);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    opacity: .3
  }).addTo(map);

  gridMarkers = L.regularGridCluster(
    {
      rules: {
        markers: {
            "radius": {
                "method": "count",
                "attribute": "",
                "scale": "continuous",
                "style": [3, 10]
            },
            'color': 'black'
        },
        grid: {},
        texts: {}
      },
      zoomShowElements: 10,
      gridOrigin: {lng: 0, lat: 0},
      zoomHideGrid: 9,
      cellSize: 10000,
      gridMode: 'hexagon',
      showCells: false,
      showMarkers: true,
      showTexts: false,
      trackingTime: false
    }
  );

  gridMarkers.addLayers(randomDataMarkers);
  gridMarkers.addTo(map);


  const gridCells = L.regularGridCluster(
    {
      rules: {
        grid: {
            "fillColor": {
                "method": "count",
                "attribute": "",
                "scale": "continuous",
                "style": ['yellow', 'red']
            },
            'color': 'black'
        },
        markers: {},
        texts: {}
      },
      zoomShowElements: 10,
      gridOrigin: {lng: 0, lat: 0},
      zoomHideGrid: 9,
      cellSize: 10000,
      gridMode: 'hexagon',
      showCells: true,
      showMarkers: false,
      showTexts: false,
      trackingTime: false
    }
  );
  console.log(gridMarkers.options.showCells, 'should be false')

  gridCells.addLayers(randomDataCells);
  gridCells.addTo(map);

});

const createRandomData = function (mode) {
  // putting some random point data
  const randomData = []
  for (var i=0; i < noTestData; i++) {
    const coordinates = [
      minX + Math.random() * (maxX - minX),
      minY + Math.random() * (maxY - minY)
    ];
    const properties = {
      a: Math.floor(Math.random() * 5)
    };

    const marker = L.circleMarker(coordinates, circleStyle(properties, mode));
    randomData.push({marker: marker, properties: properties});
  };
  return randomData;
}

const circleStyle = function (props, mode) {
  const fillColor = mode === 'cells' ? 'red' : 'black';
  return {
    fillColor: fillColor,
    color: 'black',
    weight: 1,
    radius: props.a / 2,
    fillOpacity: .5
  }
}