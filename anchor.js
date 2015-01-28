var iconFeature = new ol.Feature({
	geometry: new ol.geom.Point(ol.proj.transform([-1.985778,53.329759], 'EPSG:4326', 'EPSG:3857'))
});

var iconStyle = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [0.5, 1.0],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1.0,
		src: 'gfx/r_green.png'
	})
});

iconFeature.setStyle(iconStyle);

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
				features: [ new ol.Feature({
					'geometry': new ol.geom.LineString([
						ol.proj.transform([-2.469176,52.788348], 'EPSG:4326', 'EPSG:3857'),
						ol.proj.transform([-1.985778,53.329759], 'EPSG:4326', 'EPSG:3857'),
						ol.proj.transform([-1.392516,52.801634], 'EPSG:4326', 'EPSG:3857'),
					])
				}),
				iconFeature ],
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

