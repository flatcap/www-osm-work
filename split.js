
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
var count = 5;
for (i = 0; i < count; i++) {
	var features = [];
	var vectorSource = new ol.source.Vector({
		features: features
	});
	layers.push(
		new ol.layer.Vector({
			title: i,
			source: vectorSource
			// source: new ol.source.KML({
			// 	projection: projection,
			// 	url: 'wey/' + layer_names[i] + '.kml',
			// 	// extractStyles: false
			// })
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

var visible_1 = new ol.dom.Input(document.getElementById('visible_1')); visible_1.bindTo('checked', layers[1],  'visible');
var visible_2 = new ol.dom.Input(document.getElementById('visible_2')); visible_2.bindTo('checked', layers[2],  'visible');
var visible_3 = new ol.dom.Input(document.getElementById('visible_3')); visible_3.bindTo('checked', layers[3],  'visible');
var visible_4 = new ol.dom.Input(document.getElementById('visible_4')); visible_4.bindTo('checked', layers[4],  'visible');
var visible_5 = new ol.dom.Input(document.getElementById('visible_5')); visible_5.bindTo('checked', layers[5],  'visible');

var layer_num = 0;

map.on('click', function(evt) {
	var coordinate = evt.coordinate;
	var pt = new ol.geom.Point([evt.coordinate[0], evt.coordinate[1]]);
	var feature = new ol.Feature(pt);

	feature.setStyle (new ol.style.Style({
		image: new ol.style.Circle({
				radius: 20,
				fill: new ol.style.Fill({
					color: 'rgba(66, 150, 79, 0.8)'
				}),
				stroke: new ol.style.Stroke({
					color: 'rgba(255, 255, 255, 0.9)',
					width: 1
				}),
			})
		})
	);

	var layers = map.getLayers();

	var l = layers.item(layer_num+1);

	var src = l.getSource();

	src.addFeature(feature);

	layer_num = (layer_num+1) % 5;
	var x = 42;
});

