var map;
var maxX = 50,
  minX = 0,
  maxY = 49.5,
  minY = 0;
var noTestData = 1000;
var randomData = [];

var grid;

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

  const selects = [].slice.call(
    document.getElementsByClassName('render-on-change'),
    0
  );
  selects.map(select => {
    if (select.addEventListener) {
      select.addEventListener('change', () => {
        render();
      });
    }
  });

  render();
});

var render = () => {
  console.log(grid);
  if (map.hasLayer(grid)) {
    grid.unregister();
    map.removeLayer(grid);
  }

  // define RegularGridCluster instance
  grid = L.regularGridCluster({
    rules: getRules(),
    zoomShowElements: parseInt(
      document.getElementById('select-elements-zoom').value
    ),
    zoomHideGrid: parseInt(document.getElementById('select-grid-zoom').value),
    zoneSize: parseInt(document.getElementById('select-zone-size').value),
    gridMode: document.getElementById('select-grid-mode').value,
    showCells: document.getElementById('select-show-cells').value == '1',
    showEmptyCells:
      document.getElementById('select-show-empty-cells').value == '1',
    showMarkers: document.getElementById('select-show-markers').value == '1',
    showTexts: document.getElementById('select-show-texts').value == '1',
    trackingTime: true
  });

  grid.addLayers(randomData);
  grid.addTo(map);
};

const createRandomData = () => {
  // putting some random point data
  for (let i = 0; i < noTestData; i++) {
    const coordinates = [
      minX + Math.random() * (maxX - minX),
      minY + Math.random() * (maxY - minY)
    ];
    const properties = {
      a: 5 + Math.floor(Math.random() * 5),
      b: Math.floor(Math.random() * 5)
    };

    const marker = L.circleMarker(coordinates, circleStyle(properties));
    randomData.push({ marker: marker, properties: properties });
  }
};

const parseTextAreaValue = textAreaId => {
  const textAreaValue = document.getElementById(textAreaId).value;
  const textAreaObjectValue = '{' + textAreaValue + '}';

  try {
    return JSON.parse(textAreaObjectValue);
  } catch (err) {
    console.log(err);
    alert('bad input ' + textAreaId + ', ' + err);
    return {};
  }
};

const getRules = () => {
  const rulesTextCells = parseTextAreaValue('textarea-rules-cells');
  const rulesTextMarkers = parseTextAreaValue('textarea-rules-markers');
  const rulesTextTexts = parseTextAreaValue('textarea-rules-texts');

  return {
    cells: rulesTextCells,
    markers: rulesTextMarkers,
    texts: rulesTextTexts
  };
};

const circleStyle = props => {
  return {
    fillColor: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'][props.b],
    color: 'black',
    weight: 1,
    radius: props.a / 3,
    fillOpacity: 1
  };
};
