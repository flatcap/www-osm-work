
var v = new ol.View({
		center: ol.proj.transform([-0.7, 51.3], 'EPSG:4326', 'EPSG:3857'),
		zoom: 10
	});

var layers = [];

layers.push(new ol.layer.Tile({
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'Aerial'
		})
	})
);

var projection = ol.proj.get('EPSG:3857');

layers.push(new ol.layer.Vector({
		source: new ol.source.KML({
			projection: projection,
			url: 'wey/hike.kml',
		})
	})
);

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
	element: container
});

closer.onclick = function() {
	overlay.setPosition(undefined);
	closer.blur();
	return false;
};

var map = new ol.Map({
	layers: layers,
	target: 'map',
	overlays: [overlay],
	view: v
});

var info = $('#info');
info.tooltip({
	animation: false,
	trigger: 'manual'
});

var status_window = document.getElementById('status');

var displayFeatureInfo = function(pixel) {
	info.css({
		left: pixel[0] + 'px',
		top: (pixel[1] - 15) + 'px'
	});
	var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		return feature;
	});
	var name = "&nbsp;"
	if (feature) {
		name = feature.get('name');
		info.tooltip('hide')
			.attr('data-original-title', name)
			.tooltip('fixTitle')
			.tooltip('show');
	} else {
		info.tooltip('hide');
	}
	status_window.innerHTML = name;
};

$(map.getViewport()).on('mousemove', function(evt) {
	displayFeatureInfo(map.getEventPixel(evt.originalEvent));
});

map.on('click', function(evt) {
	displayFeatureInfo(evt.pixel);

	var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
		return feature;
	});

	if (feature) {
		var coordinate = evt.coordinate;
		var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));

		var name = feature.get('name');
		content.innerHTML = '<p>'+name+':</p><code>' + hdms + '</code>';
		overlay.setPosition(coordinate);
	}
});

document.onkeydown = function(e) {
	e = window.event || e;
	if (e.keyCode == 27) {		// Escape
		overlay.setPosition(undefined);
		closer.blur();
		e.preventDefault();
	}
}

