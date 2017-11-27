var map;
var maxX = 20,
  minX = 0,
  maxY = 20,
  minY = 0;
var noTestData = 100;
var randomData = [];

var grid;

var elementValue = (id, parse = false) => {
  const value = document.getElementById(id).value;
  return parse ? parseInt(value) : value;
};

document.addEventListener('DOMContentLoaded', function(event) {
  console.log('dom loaded');

  const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];
  createRandomData();

  // setting map
  map = L.map('map-content');
  map.fitBounds([[minY, minX], [maxY, maxX]]);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    opacity: 0.3
  }).addTo(map);

  render();
});

var render = () => {
  const gridCells = L.regularGridCluster({
    rules: {
      markers: {
        radius: {
          method: 'sum',
          attribute: 'a',
          scale: 'continuous',
          range: [10, 20]
        },
        color: 'black',
        fillOpacity: 0.6
      },
      texts: {
        text: {
          method: 'sum',
          attribute: 'a'
        },
        fontSize: '18'
      },
      cells: {}
    },
    zoomShowElements: 6,
    zoomHideGrid: 9,
    zoneSize: 50000,
    gridMode: 'hexagon',
    showCells: true,
    showTexts: true,
    showMarkers: true,
    showEmptyCells: true,
    emptyCellOptions: {
      weight: 1,
      fillOpacity: 0,
      clickable: false,
      color: 'grey',
      lineJoin: 'miter',
      fillRule: 'evenodd',
      strokeLocation: 'inside',
      interactive: false
    },
    trackingTime: false
  });

  gridCells.addLayers(randomData);
  gridCells.addTo(map);
};

const createRandomData = () => {
  // random point data
  for (let i = 0; i < noTestData; i++) {
    const coordinates = [
      minX + Math.random() * (maxX - minX),
      minY + Math.random() * (maxY - minY)
    ];
    const falseData = Math.random() > 0.7;
    const properties = {
      a: falseData ? false : 5 + Math.floor(Math.random() * 5),
      b: Math.floor(Math.random() * 5)
    };

    const marker = L.circleMarker(coordinates, circleStyle(properties));
    randomData.push({ marker: marker, properties: properties });
  }
};

const circleStyle = props => {
  if (!props.a) {
    return {
      fillColor: 'black',
      color: 'black',
      weight: 1,
      radius: 3,
      fillOpacity: 1
    };
  }
  return {
    fillColor: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'][props.b],
    color: 'black',
    weight: 1,
    radius: props.a / 3,
    fillOpacity: 1
  };
};
