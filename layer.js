
var layer_names = [
	'end',
	'route',
	'start',
	'todo',
	'variant',
	'hike',
];

var layers = [];

layers.push(new ol.layer.Tile({
		preload: Infinity,
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'Aerial'
		})
	})
);

var projection = ol.proj.get('EPSG:3857');

var i;
var count = layer_names.length;
for (i = 0; i < count; i++) {
	layers.push(
		new ol.layer.Vector({
			title: i,
			source: new ol.source.KML({
				projection: projection,
				url: 'wey/' + layer_names[i] + '.kml',
				// extractStyles: false
			})
		})
	);
}

var map = new ol.Map({
	target: 'map',
	layers: layers,
	view: new ol.View({
		center: ol.proj.transform([-0.7, 51.1], 'EPSG:4326', 'EPSG:3857'),
		zoom: 9
	})
});

var visible_end     = new ol.dom.Input(document.getElementById('visible_end'));     visible_end.bindTo    ('checked', layers[1], 'visible');
var visible_route   = new ol.dom.Input(document.getElementById('visible_route'));   visible_route.bindTo  ('checked', layers[2], 'visible');
var visible_start   = new ol.dom.Input(document.getElementById('visible_start'));   visible_start.bindTo  ('checked', layers[3], 'visible');
var visible_todo    = new ol.dom.Input(document.getElementById('visible_todo'));    visible_todo.bindTo   ('checked', layers[4], 'visible');
var visible_variant = new ol.dom.Input(document.getElementById('visible_variant')); visible_variant.bindTo('checked', layers[5], 'visible');
var visible_hike    = new ol.dom.Input(document.getElementById('visible_hike'));    visible_hike.bindTo   ('checked', layers[6], 'visible');

