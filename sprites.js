var iconInfo = [
	// Tent
	{ offset: [ 0,  0], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [12, 12] },
	{ offset: [12,  0], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [25, 25] },
	{ offset: [37,  0], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [32, 32] },
	{ offset: [69,  0], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [50, 50] },
	// Hut
	{ offset: [ 0, 50], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [12, 12] },
	{ offset: [12, 50], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [25, 25] },
	{ offset: [37, 50], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [32, 32] },
	{ offset: [69, 50], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [50, 50] },
	// Bed
	{ offset: [ 0,100], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [12, 12] },
	{ offset: [12,100], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [25, 25] },
	{ offset: [37,100], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [32, 32] },
	{ offset: [69,100], opacity: 1.0, rotateWithView: false, rotation: 0.0, scale: 1.0, size: [50, 50] },
];

var i;
var iconCount = iconInfo.length;
var icons = new Array(iconCount);
for (i = 0; i < iconCount; ++i) {
	var info = iconInfo[i];
	icons[i] = new ol.style.Icon({
		offset: info.offset,
		opacity: info.opacity,
		rotateWithView: info.rotateWithView,
		rotation: info.rotation,
		scale: info.scale,
		size: info.size,
		src: 'sprites.png'
	});
}

var featureCount = 50000;
var features = new Array(featureCount);
var feature, geometry;
var e = 25000000;
for (i = 0; i < featureCount; ++i) {
	geometry = new ol.geom.Point([2 * e * Math.random() - e, 2 * e * Math.random() - e]);
	feature = new ol.Feature(geometry);
	feature.setStyle(
			new ol.style.Style({
				image: icons[i % (iconCount - 1)]
			})
	);
	features[i] = feature;
}

var vectorSource = new ol.source.Vector({
	features: features
});
var vector = new ol.layer.Vector({
	source: vectorSource
});

var map = new ol.Map({
	// renderer: 'webgl',
	layers: [vector],
	target: document.getElementById('map'),
	view: new ol.View({
		center: [0, 0],
		zoom: 5
	})
});

var overlayFeatures = [];
for (i = 0; i < featureCount; i += 30) {
	var clone = features[i].clone();
	clone.setStyle(null);
	overlayFeatures.push(clone);
}

var featureOverlay = new ol.FeatureOverlay({
	map: map,
	style: new ol.style.Style({
		image: icons[iconCount - 1]
	}),
	features: overlayFeatures
});

