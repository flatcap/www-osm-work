
var layers = [];

layers.push(new ol.layer.Tile({
		preload: Infinity,
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'Aerial'
		})
	})
);

var createLineStyleFunction = function() {
	return function(feature, resolution) {
		var colour = 0;
		var random = Math.random() * 5;
		if (random < 1) {
			colour = '#ff0000';	// red
		} else if (random < 2) {
			colour = '#ffff00';	// yellow
		} else if (random < 3) {
			colour = '#00ff00';	// green
		} else if (random < 4) {
			colour = '#00ffff';	// cyan
		} else {
			colour = '#ff00ff';	// magenta
		}

		var width = 2;
		if (resolution < 100) { width = 4; }
		else if (resolution < 500) { width = 3; }
		else if (resolution < 1000) { width = 2; }
		else { width = 1; }

		var style = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: colour,
				width: width,
			}),
		});
		return [style];
	};
};

var projection = ol.proj.get('EPSG:3857');
layers.push(
	new ol.layer.Vector({
		source: new ol.source.KML({
			projection: projection,
			url: 'style.kml',
			extractStyles: false
		}),
		style: createLineStyleFunction(),
	})
);

var view = new ol.View({
		center: ol.proj.transform([-2.0, 54.5], 'EPSG:4326', 'EPSG:3857'),
		zoom: 7
	})
var map = new ol.Map({
	target: 'map',
	layers: layers,
	view: view,
});

var visible = new ol.dom.Input(document.getElementById('visible'));
visible.bindTo ('checked', layers[1], 'visible');

var opacity = new ol.dom.Input(document.getElementById('opacity'));
opacity.bindTo('value', layers[1], 'opacity').transform(parseFloat, String);

var resolution = new ol.dom.Input(document.getElementById('resolution'));
resolution.bindTo('value', view, 'resolution').transform(parseFloat, String);

