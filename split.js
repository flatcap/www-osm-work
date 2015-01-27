
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
		})
	);
}

var map = new ol.Map({
	target: 'map',
	layers: layers,
	view: new ol.View({
		center: ol.proj.transform([-0.7, 54.1], 'EPSG:4326', 'EPSG:3857'),
		zoom: 7
	})
});

var visible_1 = new ol.dom.Input(document.getElementById('visible_1')); visible_1.bindTo('checked', layers[1],  'visible');
var visible_2 = new ol.dom.Input(document.getElementById('visible_2')); visible_2.bindTo('checked', layers[2],  'visible');
var visible_3 = new ol.dom.Input(document.getElementById('visible_3')); visible_3.bindTo('checked', layers[3],  'visible');
var visible_4 = new ol.dom.Input(document.getElementById('visible_4')); visible_4.bindTo('checked', layers[4],  'visible');
var visible_5 = new ol.dom.Input(document.getElementById('visible_5')); visible_5.bindTo('checked', layers[5],  'visible');

var layer_num = 0;
var projection = ol.proj.get('EPSG:3857');
var listenerKey;

map.on('click', function(evt) {

	var vector = new ol.layer.Vector({
		source: new ol.source.KML({
			projection: projection,
			url: 'split.kml'
		})
	});

	var src = vector.getSource();

	listenerKey = src.on('change', function(e) {
		if (src.getState() == 'ready') {
			src.unByKey(listenerKey);

			var features = [];
			src.forEachFeature(function(feature) {
				var id = feature.getId();
				if (id) {
					features.push(id);
				}
				var name = feature.get('name');
				if (name) {
					features.push(name);
				}

				var clone = feature.clone();
				clone.setId(feature.getId());

				var layers = map.getLayers();

				var l = layers.item(layer_num+1);

				var src = l.getSource();

				var colour = 0;
				if (layer_num === 0) {
					colour = '#ff0000';	// red
				} else if (layer_num == 1) {
					colour = '#ffff00';	// yellow
				} else if (layer_num == 2) {
					colour = '#00ff00';	// green
				} else if (layer_num == 3) {
					colour = '#00ffff';	// cyan
				} else {
					colour = '#ff00ff';	// magenta
				}

				feature.setStyle (new ol.style.Style({
						stroke: new ol.style.Stroke({
							// color: 'rgba(255, 0, 0, 1.0)',
							color: colour,
							width: 3
						}),
					})
				);

				src.addFeature(feature);

				layer_num = (layer_num+1) % 5;
			});

			// if (features.length > 0) {
			// 	alert (features.join(', '));
			// } else {
			// 	alert ("no data");
			// }
		}
	});

});

