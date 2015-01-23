
var map = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM(),
		})
	],
	view: new ol.View({
		center: ol.proj.transform([-0.7, 54.1], 'EPSG:4326', 'EPSG:3857'),
		zoom: 7,
		minZoom: 9,
		maxZoom: 13
	}),
	controls: ol.control.defaults({
		attributionOptions: ({
			collapsible: true
		})
	}).extend([
		new ol.control.FullScreen(),
		new ol.control.ZoomToExtent({
			extent: [
				813079.7791264898, 5929220.284081122,
				848966.9639063801, 5936863.986909639
			]
		}),
		new ol.control.Rotate({
			// target: 'hide',
			autoHide: true,
		}),
		new ol.control.ScaleLine({
			units: 'imperial',
			minWidth: 200,
			target: 'scale',
		}),
		new ol.control.Zoom({
			delta: 1.0,
			zoomInTipLabel: 'Bigger',
			zoomOutTipLabel: 'Smaller',
		}),
		new ol.control.ZoomSlider({
			minResolution: 200,
			maxResolution: 2000,
		}),
		new ol.control.MousePosition({
			coordinateFormat: ol.coordinate.createStringXY(6),
			target: 'mouse',
			projection: 'EPSG:4326',
			className: 'wibble',
		}),
	]),
});

