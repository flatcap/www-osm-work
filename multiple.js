
var dirs = [
	'1066.country.walk',	'join.2',		'saxon.shore',
	'arden.way',		'join.3',		'sefton.coast',
	'cleveland.way',	'join.4',		'severn.way',
	'coast.to.coast',	'join.5',		'snowdon.horseshoe',
	'coastline',		'join.6',		'solent.way',
	'cotswold.canals',	'join.7',		'south.downs',
	'coventry.way',		'join.8',		'south.west.coast',
	'cumbria.coast',	'kent.coast',		'staffordshire.moorlands',
	'dales.centurion',	'lancashire.coast',	'staffordshire.way',
	'dales.top.ten',	'lyke.wake.walk',	'tameside.trail',
	'dales.walk',		'north.downs',		'thames.path',
	'e2',			'offas.dyke',		'thanet.coast',
	'e9',			'oldham.way',		'wales.coast',
	'gloucestershire.way',	'oxford.canal',		'west.somerset.coast',
	'gritstone.trail',	'oxford.green.belt',	'wey.navigations',
	'hadrians.coast',	'oxfordshire.way',	'white.cliffs',
	'hadrians.wall',	'pembrokeshire.coast',	'wirral.circular',
	'heart.of.england',	'pennine.way',		'wysis.way',
	'isle.of.wight.coast',	'pilgrims.way',
	'join.1',		'river.parrett',
];

var projection = ol.proj.get('EPSG:3857');

var map = new ol.Map({
	target: 'map',
	layers: [ new ol.layer.Tile({
		preload: Infinity,
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'Aerial'
		})
	})],
	view: new ol.View({
		center: ol.proj.transform([-3.143848, 54.699234], 'EPSG:4326', 'EPSG:3857'),
		zoom: 6
	}),
});

var b_load = document.getElementById('button_load');
b_load.addEventListener('click', function() {
	var count = dirs.length;
	var i = 0;
	for (i = 0; i < count; i++) {
		var dir = 'routes/' + dirs[i] + '/hike.kml';
		var l = new ol.layer.Vector({
			source: new ol.source.KML({
				projection: projection,
				url: dir,
				extractStyles: false
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#00FF00',
					width: 2,
				}),
			}),
		});
		map.addLayer(l);
	}
}, false);

var b_clear = document.getElementById('button_clear');
b_clear.addEventListener('click', function() {
	var map_layers = map.getLayers();
	while (map_layers.getLength() > 1) {
		map.removeLayer(map_layers.item(1));
	}
}, false);

var b_count = document.getElementById('button_count');
b_count.addEventListener('click', function() {
	var map_layers = map.getLayers();
	alert (map_layers.getLength());
}, false);

