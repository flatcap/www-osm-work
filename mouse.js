
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
		url: 'camp.kml',
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

var map = new ol.Map({
	target: document.getElementById('map'),
	layers: layers,
	view: new ol.View({
		center: ol.proj.transform([1.315772,51.125442], 'EPSG:4326', 'EPSG:3857'),
		zoom: 9
	}),
});

var message = document.getElementById('message');
message.innerHTML = "waiting...";

$(map.getViewport()).on('mousemove', function(evt) {
	// var pixel = map.getEventPixel(evt.originalEvent);
	// var hit = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
	// 	return true;
	// });
	// if (hit) {
	// 	map.getTarget().style.cursor = 'pointer';
	// } else {
	// 	map.getTarget().style.cursor = '';
	// }

	var l = map.getLayers().item(1);
	var s = l.getSource();

	var mouse_coord = map.getEventCoordinate(evt.originalEvent);

	var feature = s.getClosestFeatureToCoordinate(mouse_coord);
	var geom = feature.getGeometry();
	var feature_coord = geom.getClosestPoint(mouse_coord);

	var line = new ol.geom.LineString([mouse_coord, feature_coord]);

	var dummy = 42;

	if (line) {
		// message.innerHTML = closest.get('description');
		message.innerHTML = line.getLength();
	} else {
		alert ("no closest");
	}
});

