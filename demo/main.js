var map;
var maxX = 50, minX = 0, maxY = 49.5, minY = 0;
var noTestData = 1000;
var randomData = [];

var grid;

document.addEventListener("DOMContentLoaded", function(event) {
  console.log('dom loaded')

  var colors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00'];
  createRandomData()

  // setting map
  map = L.map('map-content')
  map.fitBounds([[minY, minX], [maxY, maxX]]);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    opacity: .3
  }).addTo(map);

  var selects = [].slice.call(document.getElementsByClassName('render-on-change'), 0);
  for (var si in selects) {
    var select = selects[si];

    if (select.addEventListener) {
      select.addEventListener('change', function () {
        render()
      });
    };
  }; 

  render();
})

var render = function () {
  console.log('demo renders');
  if (map.hasLayer(grid)) {
    grid.unregister();
    map.removeLayer(grid);
  }


  // define RegularGridCluster instance
  grid = L.regularGridCluster(
    {
      rules: getRules(),
      zoomShowElements: parseInt(document.getElementById('select-elements-zoom').value),
      zoomHideGrid: parseInt(document.getElementById('select-grid-zoom').value),
      cellSize: parseInt(document.getElementById('select-cell-size').value),
      gridMode: document.getElementById('select-grid-mode').value,
      trackingTime: true
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


var parseTextAreaValue = function (textAreaId) {
  var textAreaValue = document.getElementById(textAreaId).value;
  var textAreaObjectValue = '{' + textAreaValue + '}';

  try {
    return JSON.parse(textAreaObjectValue);
  } catch (err) {
    console.log(err);
    alert('bad input ' + textAreaId + ', ' +  err);
    return {}
  }
}

var getRules = function () {
  var rulesTextGrid = parseTextAreaValue('textarea-rules-grid');
  var rulesTextMarkers = parseTextAreaValue('textarea-rules-markers');
  var rulesTextTexts = parseTextAreaValue('textarea-rules-texts');

  return {
    "grid": rulesTextGrid,
    "markers": rulesTextMarkers,
    "texts": rulesTextTexts
  }
} 