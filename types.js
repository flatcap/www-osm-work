
var v = new ol.View({
		center: ol.proj.transform([-3.143848, 54.699234], 'EPSG:4326', 'EPSG:3857'),
		zoom: 6
	});

var src =
	new ol.source.OSM();		// OSM StreetView : 5-19 (0-4 = country outlines)

	// new ol.source.TileJSON({	// Terrain: 0-6
	// // 	url: 'http://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.jsonp',
	// 	url: 'http://api.tiles.mapbox.com/v3/mapbox.world-black.jsonp',	// silhouette : 1-13
	// });

	// new ol.source.BingMaps({
	// 	key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
	// 	imagerySet: 'Road',			// 5-18 (0-4 = country outlines)
	// 	// imagerySet: 'Aerial',			// 1-19
	// 	// imagerySet: 'AerialWithLabels',		// 5-19 (0-4\ =\ country\ outlines)
	// 	// imagerySet: 'collinsBart',		// 10-13 (terrain-ish)
	// 	// imagerySet: 'ordnanceSurvey',		// 10-11 (fuzzy), 12-14 (1:50), 15-17 (1:25)
	// });

	// new ol.source.Stamen({
	// 	layer: 'watercolor'		// Pastels: 1-17
	// 	// layer: 'toner'			// Black/white: 0-19
	// 	// layer: 'toner-background'		// Black/white (no-labels): 0-19
	// 	// layer: 'toner-lines'			// Black/white (labels only): 0-19
	// });

var map = new ol.Map({
	layers: [
		new ol.layer.Tile({
			source: src
		}),
	],
	target: 'map',
	view: v
});

var resolution = new ol.dom.Input(document.getElementById('resolution'));
resolution.bindTo('value', v, 'resolution').transform(parseFloat, String);

var zoom = new ol.dom.Input(document.getElementById('zoom'));
zoom.bindTo('value', v, 'zoom').transform(parseFloat, String);

