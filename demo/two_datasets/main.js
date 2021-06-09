var map;
var maxX = 50,
  minX = 0,
  maxY = 49.5,
  minY = 0;
var noTestData = 1000;
var gridMarkers = {};

document.addEventListener("DOMContentLoaded", function (event) {
  console.log("dom loaded");

  const randomDataCells = createRandomData("cells");
  const randomDataMarkers = createRandomData("markers");

  // setting map
  map = L.map("map-content");
  map.fitBounds([
    [minY, minX],
    [maxY, maxX],
  ]);

  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    opacity: 0.3,
  }).addTo(map);

  gridMarkers = L.regularGridCluster({
    rules: {
      markers: {
        radius: {
          method: "mean",
          attribute: "a",
          scale: "continuous",
          range: [-5, 10],
        },
        color: "black",
      },
      cells: {},
      texts: {},
    },
    zoomShowElements: 10,
    zoomHideGrid: 9,
    zoneSize: 10000,
    gridMode: "hexagon",
    showCells: false,
    gridOrigin: { lat: 0, lng: 0 },
    showMarkers: true,
    showTexts: false,
    trackingTime: false,
  });

  gridMarkers.addLayers(randomDataMarkers);
  gridMarkers.addTo(map);

  const gridCells = L.regularGridCluster({
    rules: {
      cells: {
        fillColor: {
          method: "count",
          attribute: "",
          scale: "continuous",
          range: ["yellow", "red"],
        },
        color: "black",
        fillOpacity: 0.6,
      },
      markers: {},
      texts: {},
    },
    zoomShowElements: 10,
    zoomHideGrid: 9,
    zoneSize: 10000,
    gridMode: "hexagon",
    showCells: true,
    showEmptyCells: true,
    emptyCellOptions: {
      weight: 1,
      fillOpacity: 0,
      clickable: false,
      color: "grey",
      lineJoin: "miter",
      fillRule: "evenodd",
      strokeLocation: "inside",
      interactive: false,
    },
    gridOrigin: { lat: 0, lng: 0 },
    gridEnd: { lat: 30, lng: 80 },
    showMarkers: false,
    showTexts: false,
    trackingTime: false,
  });

  gridCells.addLayers(randomDataCells);
  gridCells.addTo(map);
});

const createRandomData = function (mode) {
  // random point data
  const randomData = [];
  const x = minX;
  for (let i = 0; i < noTestData; i++) {
    const coordinates = [
      x + Math.random() * (maxX - x),
      minY + Math.random() * (maxY - minY),
    ];
    const properties = {
      a: Math.floor(Math.random() * 5),
    };

    const marker = L.circleMarker(coordinates, circleStyle(properties, mode));
    randomData.push({ marker: marker, properties: properties });
  }
  return randomData;
};

const circleStyle = function (props, mode) {
  const fillColor = mode === "cells" ? "red" : "black";
  return {
    fillColor: fillColor,
    color: "black",
    weight: 1,
    radius: props.a / 2,
    fillOpacity: 0.5,
  };
};
