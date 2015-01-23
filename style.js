
var layers = [];

layers.push(new ol.layer.Tile({
		preload: Infinity,
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'Aerial'
		})
	})
);

function createLineStyle (feature, resolution) {
	var red   = 0;
	var green = 0;
	var blue  = 0;
	var random = Math.random() * 5;
	if (random < 1) {
		red = 255;
	} else if (random < 2) {
		red = 255;
		green = 255;
	} else if (random < 3) {
		green = 255;
	} else if (random < 4) {
		green = 255;
		blue = 255;
	} else {
		red = 255;
		blue = 255;
	}

	var opacity = Math.random();

	var colour = "rgba(" + red + "," + green + "," + blue + "," + opacity + ")";

	var width;
	if      (resolution <  100) { width = 4; }
	else if (resolution <  500) { width = 3; }
	else if (resolution < 1000) { width = 2; }
	else                        { width = 1; }

	var style = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: colour,
			width: width,
		}),
	});
	return [style];
}

var projection = ol.proj.get('EPSG:3857');
layers.push(
	new ol.layer.Vector({
		source: new ol.source.KML({
			projection: projection,
			url: 'style.kml',
			extractStyles: false
		}),
		style: createLineStyle,
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

