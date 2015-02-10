
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

var vectorSource = new ol.source.KML({
	projection: proj,
	url: 'mouse.kml',
	extractStyles: false,
});

layers.push(new ol.layer.Vector({
	source: vectorSource,
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
		center: ol.proj.transform([-3.143848, 54.699234], 'EPSG:4326', 'EPSG:3857'),
		zoom: 6
	}),
});

var msg = document.getElementById('message');
msg.innerHTML = 'Waiting...';

var res = document.getElementById('resolution');
res.innerHTML = 'Waiting...';

var distance = document.getElementById('distance');
distance.innerHTML = 'Waiting...';

var pixel_count = document.getElementById('pixel');
pixel_count.innerHTML = 'Waiting...';

var line = null;
$(map.getViewport()).on('mousemove', function(evt) {
	var pixel = map.getEventPixel(evt.originalEvent);
	var hit = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		return true;
	});
	if (hit) {
		map.getTarget().style.cursor = 'pointer';
	} else {
		map.getTarget().style.cursor = '';
	}

	var coordinate = map.getEventCoordinate(evt.originalEvent);
	var closestFeature = vectorSource.getClosestFeatureToCoordinate(coordinate);
	if (closestFeature === null) {
		line = null;
	} else {
		var geometry = closestFeature.getGeometry();
		var closestPoint = geometry.getClosestPoint(coordinate);
		coordinate.push(0);
		if (line === null) {
			line = new ol.geom.LineString([coordinate, closestPoint]);
		} else {
			line.setCoordinates([coordinate, closestPoint]);
		}
		var len = line.getLength();
		// if (len > 100000) {
		var x = map.getView().getResolution();
		if (len/x > 100) {
			line = null;
		} else {
			msg.innerHTML = closestFeature.get('description');
		}

		distance.innerHTML = len.toFixed(0);
		var r = map.getView().getResolution();
		res.innerHTML = r.toFixed(0);
		var p = len/r;
		pixel_count.innerHTML = p.toFixed(0);
	}
	map.render();
});

var strokeStyle = new ol.style.Stroke({
	color: 'rgba(255,255,0,0.9)',
	width: 3
});
map.on('postcompose', function(evt) {
	var vectorContext = evt.vectorContext;
	if (line !== null) {
		vectorContext.setFillStrokeStyle(null, strokeStyle);
		vectorContext.drawLineStringGeometry(line);
	}
});

