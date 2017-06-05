# (experimental) Regular-grid-cluster plugin/library for Leaflet

![image](./img.png)

## demo
[random data example](https://adammertel.github.io/Leaflet.RegularGridCluster/demo/random_data )
[two datasets example](https://adammertel.github.io/Leaflet.RegularGridCluster/demo/two_datasets )

## motivation
the basic idea of this library is to present the custom method to both **visualise and cluster** spatial data. This method is based on **regular grid** (hexagonal or square) that could be extended with centered circle markers and/or labels. Plugin can work with **point data** in the form of L.Marker or L.Circle/L.CircleMarker. This concept is suitable to display **multivariate datasets**.

## how to
1. Create/Access some point data

```
    const maxX = 50, minX = 0, maxY = 49.5, minY = 0;
    const randomData = [];

    for (i=0; i < 1000; i++) {
        const coordinates = [
            minX + Math.random() * (maxX - minX),
            minY + Math.random() * (maxY - minY)
        ];
        const properties = {
            a: 5 + Math.floor(Math.random() * 5),
            b: Math.floor(Math.random() * 5)
        };

        const marker = L.circleMarker(coordinates, circleStyle(properties));
        randomData.push( {
            marker: marker, 
            properties: properties
        });
    };
```


2. Define the ruleset
```
    const rules = {
        grid: {
            "fillColor": {
                "method": "mean",
                "attribute": "b",
                "scale": "size",
                "style": ["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"]
            },
            "color": "black",
            "fillOpacity": 0.2,
            "weight": 0
        },
        markers: {
            "color": "white",
            "weight": 2,
            "fillOpacity": 0.9,
            "fillColor": {
                "method": "mean",
                "attribute": "b",
                "scale": "continuous",
                "style": ["#ffffb2","#fecc5c","#fd8d3c","#e31a1c"]
            },
            "radius": {
                "method": "count",
                "attribute": "",
                "scale": "continuous",
                "style": [7, 17]
            }
        },
        texts: {}
    }
```

3. create a new instance of L.RegularGridCluster and set the options and ruleset
```
    const grid = L.regularGridCluster(
        {
            rules: rules,
            gridMode: 'hexagon,
            showCells: true,
            showMarkers: true,
            showTexts: false
        }
    );
```

4. add data to the L.regularGridCluster instance
```
    grid.addLayers(pointData);
```
