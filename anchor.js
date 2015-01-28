var pt1 = [-2.469176,52.788348];
var pt2 = [-1.985778,53.329759];
var pt3 = [-1.392516,52.801634];

var f1 = new ol.Feature({
	'geometry': new ol.geom.LineString([
		ol.proj.transform(pt1, 'EPSG:4326', 'EPSG:3857'),
		ol.proj.transform(pt2, 'EPSG:4326', 'EPSG:3857'),
		ol.proj.transform(pt3, 'EPSG:4326', 'EPSG:3857'),
	])
});

var f2 = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.transform(pt1, 'EPSG:4326', 'EPSG:3857')) });
var f3 = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.transform(pt2, 'EPSG:4326', 'EPSG:3857')) });
var f4 = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.transform(pt3, 'EPSG:4326', 'EPSG:3857')) });

var i2 = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [0.5, 1.0],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1.0,
		src: 'gfx/r_green.png'
	})
});

var i3 = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [0.5, 1.0],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1.0,
		src: 'gfx/r_yellow.png'
	})
});

var i4 = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [0.5, 1.0],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1.0,
		src: 'gfx/r_red.png'
	})
});

f2.setStyle(i2);
f3.setStyle(i3);
f4.setStyle(i4);

var map = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.BingMaps({
				key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
				imagerySet: 'Aerial'
			})
		}),
		new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [ f1, f2, f3, f4 ],
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#FF0000',
					width: 1
				})
			})
		})
	],
	view: new ol.View({
		center: ol.proj.transform([-3.143848, 54.699234], 'EPSG:4326', 'EPSG:3857'),
		zoom: 6
	})
});

