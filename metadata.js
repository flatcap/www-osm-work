
var proj = ol.proj.get('EPSG:3857');

var layers = [];
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

layers.push (new ol.layer.Vector({
	source: new ol.source.GeoJSON({
		projection: 'EPSG:3857',
		url: 'metadata.geojson',
	}),
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#ffff00',
			width: 3
		}),
	}),
}));


var map = new ol.Map({
	target: 'map',
	layers: layers,
	view: new ol.View({
		center: ol.proj.transform([1.315772,51.125442], 'EPSG:4326', 'EPSG:3857'),
		zoom: 9
	})
});

map.on('click', function(evt) {
	var l = layers[1];
	var s = l.getSource();
	var f = s.getFeatures();
	var d = f[0];
	alert (
		"Id: "        + d.getId()           + "\n" +
		"Name: "      + d.get('name')       + "\n" +
		"Layer: "     + d.get('layer')      + "\n" +
		"Elevation: " + d.get('elevation')  + "\n" +
		"Length: "    + d.get('shape_leng') + "\n" +
		"Area: "      + d.get('shape_area') + "\n" +
		"Key: "       + d.get('key')        + "\n" +
		"Zone: "      + d.get('zone')       + "\n"
	);

	var l = layers[2];
	var s = l.getSource();
	var f = s.getFeatures();
	var d = f[0];
	alert (
		"Id: "      + d.getId()            + "\n" +
		"Name: "    + d.get('name')        + "\n" +
		"Number: "  + d.get('holeNumber')  + "\n" +
		"Par: "     + d.get('holePar')     + "\n" +
		"Yardage: " + d.get('holeYardage') + "\n"
	);

	var l = layers[3];
	var s = l.getSource();
	var f = s.getFeatures();
	var d = f[0];
	alert (
		"Id: "     + d.getId()       + "\n" +
		"Name: "   + d.get('name')   + "\n" +
		"Wibble: " + d.get('wibble') + "\n" +
		"Number: " + d.get('number') + "\n" +
		"George: " + d.get('george') + "\n"
	);
});


// var key = src.on('change', function(e) {
// 	if (src.getState() == 'ready') {
// 		// alert ("ready");
// 		src.unByKey(key);
// 	}
// });

