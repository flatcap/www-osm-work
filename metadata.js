
var layers = [];

var proj = ol.proj.get('EPSG:3857');

layers.push(new ol.layer.Tile({
		preload: Infinity,
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'Aerial'
		})
	})
);

layers.push (new ol.layer.Vector({
	source: new ol.source.KML({
		projection: proj,
		url: 'metadata1.kml',
		extractStyles: false,
	}),
	style: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 7,
			fill: new ol.style.Fill({
				color: '#ff0000',
			}),
			stroke: new ol.style.Stroke({
				color: '#ffffff',
				width: 1
			}),
		}),
	}),
}));

layers.push (new ol.layer.Vector({
	source: new ol.source.KML({
		projection: proj,
		url: 'metadata2.kml',
		extractStyles: false,
	}),
	style: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 7,
			fill: new ol.style.Fill({
				color: '#00ff00',
			}),
			stroke: new ol.style.Stroke({
				color: '#ffffff',
				width: 1
			}),
		}),
	}),
}));


// var src = new ol.source.GeoJSON({
// 	object: {
// 		'type': 'FeatureCollection',
// 		'features': [
// 			{
// 				'type': 'Feature',
// 				'geometry': {
// 					'type': 'LineString',
// 					'coordinates': [
// 						[ 0.978846,51.005991 ],
// 						[ 0.985711,51.014840 ],
// 						[ 0.994678,51.023083 ],
// 						[ 1.004872,51.030592 ],
// 						[ 1.016682,51.036984 ],
// 						[ 1.028208,51.043596 ],
// 						[ 1.037116,51.050573 ],
// 						[ 1.046141,51.058065 ],
// 						[ 1.057605,51.063913 ],
// 						[ 1.069176,51.070074 ],
// 						[ 1.084375,51.070037 ],
// 						[ 1.100853,51.070622 ],
// 						[ 1.116180,51.071326 ],
// 						[ 1.132036,51.072044 ],
// 						[ 1.148544,51.074128 ],
// 						[ 1.164041,51.076350 ],
// 						[ 1.180028,51.079537 ],
// 						[ 1.196611,51.083504 ],
// 					]
// 				}
// 			},
// 		]
// 	}
// });

var src = new ol.source.GeoJSON({
	projection: 'EPSG:3857',
	url: 'metadata.geojson',
});

layers.push (new ol.layer.Vector({
	source: src,
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#ffff00',
			width: 3
		}),
	}),
}));


// alert ("wait");
// var s = layers[3].getSource();
// var f = s.getFeatures();
// var l = f[0];
// if (l) {
// 	var g = l.getGeometry();
// 	g.transform ('EPSG:4326', 'EPSG:3857');
// } else {
// 	alert ("no l");
// }

var map = new ol.Map({
	target: 'map',
	layers: layers,
	view: new ol.View({
		center: ol.proj.transform([1.315772,51.125442], 'EPSG:4326', 'EPSG:3857'),
		zoom: 9
	})
});

// alert (layers.length);

var key = src.on('change', function(e) {
	alert ("event");
	if (src.getState() == 'ready') {
		alert ("ready");
		// hide loading icon
		// ...
		// and unregister the "change" listener
		// ol.Observable.unByKey(key);
		// or src.unByKey(key) if
		// you don't use the current master branch
		// of ol3
	}
});

// map.on('click', function(evt) {
// 	var l = layers[1];
// 	var s = l.getSource();
// 	var f = s.getFeatures();
// 	var d = f[0];
// 	alert (
// 		"Id: "        + d.getId()           + "\n" +
// 		"Name: "      + d.get('name')       + "\n" +
// 		"Layer: "     + d.get('layer')      + "\n" +
// 		"Elevation: " + d.get('elevation')  + "\n" +
// 		"Length: "    + d.get('shape_leng') + "\n" +
// 		"Area: "      + d.get('shape_area') + "\n" +
// 		"Key: "       + d.get('key')        + "\n" +
// 		"Zone: "      + d.get('zone')       + "\n"
// 	);
// });

// map.on('click', function(evt) {
// 	var l = layers[2];
// 	var s = l.getSource();
// 	var f = s.getFeatures();
// 	var d = f[0];
// 	alert (
// 		"Id: "      + d.getId()            + "\n" +
// 		"Name: "    + d.get('name')        + "\n" +
// 		"Number: "  + d.get('holeNumber')  + "\n" +
// 		"Par: "     + d.get('holePar')     + "\n" +
// 		"Yardage: " + d.get('holeYardage') + "\n"
// 	);
// });

// map.on('click', function(evt) {
// 	var l = layers[3];
// 	var s = l.getSource();
// 	var f = s.getFeatures();
// 	var d = f[0];
// 	alert (
// 		"Id: "      + d.getId()            + "\n" +
// 		"Name: "    + d.get('name')        + "\n" //+
// 		// "Number: "  + d.get('holeNumber')  + "\n" +
// 		// "Par: "     + d.get('holePar')     + "\n" +
// 		// "Yardage: " + d.get('holeYardage') + "\n"
// 	);
// });


var dummy = 42;
