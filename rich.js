/*
 * Copyright (c) 2013-2015 Richard Russon (flatcap)
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see http://www.gnu.org/licenses/
 */

var DEBUG       = false;
				// Options:
var opt_one     = true;		//	Only show one route at a time
var opt_zoom    = true;		//	Zoom in to the current route
var opt_alldone = false;
				// Show list of:
var show_comp   = true;		//	Completed routes
var show_inco   = false;		//	Incomplete routes
var show_unst   = false;	//	Unstarted routes
var show_hill   = false;		//	Sets of hills
var show_join   = false;		//	Non-route joins

var show_html = {};		// Keep the select HTML to rebuild the dropdown

var map;
var route_list;

var maps   = {};
var layers = {};
var styles = {};
var icons  = {};
var areas  = {};

var uk_hull;
var route_info;
var item_info;

//------------------------------------------------------------------------------

function route_sort (a, b)
{
	if (a.fullname > b.fullname) {
		return 1;
	} else if (a.fullname < b.fullname) {
		return -1;
	} else {
		return 0;
	}
}

function format_date (datestr)
{
	var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

	if (!datestr) {
		return '';
	}

	var d = new Date (datestr);
	if (!d) {
		return '';
	}

	return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

Date.prototype.diff = function (str)
{
	var d = new Date(str);

	return Math.floor ((this - d) / 86400000);
};


//------------------------------------------------------------------------------

function dd_populate()
{
	var dd = $('#dropdown');
	var value = dd.value;
	var html = '';

	if (show_comp) { html += show_html.comp; }
	if (show_inco) { html += show_html.inco; }
	if (show_unst) { html += show_html.unst; }
	if (show_hill) { html += show_html.hill; }
	if (show_join) { html += show_html.join; }

	dd.html (html);

	// If possible, leave the selection unchanged
	dd_select (value);

	return dd;
}

function dd_select (route)
{
	$('#dropdown').val (route);
}


function set_defaults()
{
	layers.area_done    .setVisible (false);
	layers.area_hull    .setVisible (false);
	layers.area_todo    .setVisible (false);
	layers.area_whole   .setVisible (false);

	layers.extra        .setVisible (false);

	layers.icon_end     .setVisible (false);
	layers.icon_ferry   .setVisible (false);
	layers.icon_hotel   .setVisible (false);
	layers.icon_hut     .setVisible (false);
	layers.icon_rich    .setVisible (false);
	layers.icon_start   .setVisible (false);
	layers.icon_tent    .setVisible (false);
	layers.icon_waves   .setVisible (false);

	layers.line_hike    .setVisible (false);
	layers.line_river   .setVisible (true);
	layers.line_route   .setVisible (false);
	layers.line_todo    .setVisible (false);
	layers.line_variant .setVisible (false);

	layers.peak_done    .setVisible (true);
	layers.peak_todo    .setVisible (true);
}


function map_clear()
{
	$.each (layers, function (name, layer) {
		if (name == 'icon_rich') {
			return true;
		}
		layer.setSource (new ol.source.Vector());
	});
	route_info.html ('');
	item_info.html ('');
}

function map_reset()
{
	map_clear();
	dd_select ('');
}

function map_zoom_route (route)
{
	if (opt_alldone) {
		return;
	}

	var view = map.getView();
	var size = map.getSize();

	if (route) {
		var lay = layers.area_hull;
		var src = lay.getSource();
		var fts = src.getFeatures();

		if (fts.length > 0) {
			$.each (fts, function (index, item) {
				var dir = item.get ('hike_dir');
				if (dir == route) {
					var geom = item.getGeometry();
					view.fitGeometry (geom, size, { padding: [10, 10, 10, 10] });
					return false;
				}
			});
		}
	} else {
		view.fitGeometry (uk_hull, size);
	}
}

function map_show_all()
{
	dd_select();
	map_zoom_route();
	opt_alldone = true;
	$.each (route_list, function (dir, route) {
		if (route.dist_walked > 0) {
			load_kml (dir);
		}
	});
}


function html_distance (route, newline)
{
	if (!route) {
		return '';
	}

	var output = '';

	var complete = route.complete    || 0;
	var walk     = route.dist_walked || 0;
	var dist     = route.dist_route;

	if ((complete == 100) && (walk > 0)) {
		dist = route.dist_walked;
	}

	output += '<span>Route</span> ' + dist + ' miles';

	if (complete) {
		if (complete == 100) {
			output += ' (Complete)';
		} else if (route.complete > 0) {
			output += ' (' + complete + '%)';
		}
	}

	if (newline) {
		output += '<br />';
	}

	return output;

}

function html_camps (route, newline)
{
	if (!route) {
		return '';
	}

	var output = '';

	var other  = route.days_other  || 0;
	var camped = route.days_camped || 0;
	var total  = camped + other;

	if (total === 0) {
		return '';
	}

	output += '<span>Camped</span> ' + total + ' night';
	if (total != 1) {
		output += 's';
	}

	if (other > 0) {
		output += ' (' + camped + ' under canvas)';
	}

	if (newline) {
		output += '<br />';
	}

	return output;

}

function show_route_info (dir)
{
	if (!dir) {
		return;
	}

	var r = route_list[dir];
	if (!r) {
		return;
	}

	var output;

	output = '<h1>' + r.fullname + '</h1>';
	if (r.description) {
		output += '<span class="desc">' + r.description + '</span><br><br>';
	}

	output += '<div class="format">';
	output += html_distance (r, true);

	var start = r.date_start;
	if (start) {
		output += '<span>Started</span> ' + format_date (start) + '<br />';
	}

	var end = r.date_end;
	if (end) {
		output += '<span>Finished</span> ' + format_date (end) + '<br />';
	}

	var walked = r.days_walked;
	if (walked) {
		output += '<span>Hiked</span> ' + walked + ' day';
		if (walked != 1) {
			output += 's';
		}
		output += '<br />';
	}

	output += html_camps (r, true);
	output += '</div>';

	route_info.html (output);
}


function get_line_title (feature)
{
	if (!feature) {
		return '';
	}

	var tag = feature.get('tag');
	if (!tag) {
		return '';
	}

	     if (tag == 'route')   { tag = 'Official Route';     }
	else if (tag == 'todo')    { tag = 'Route (Not Walked)'; }
	else if (tag == 'hike')    { tag = 'Route (Walked)';     }
	else if (tag == 'variant') { tag = 'Alternate Route';    }
	else if (tag == 'river')   { tag = 'River Crossing';     }

	var str = '<span>Type</span> ' + tag + '<br />';
	return str;
}

function get_climbed (feature)
{
	if (!feature) {
		return '';
	}

	var date = feature.get ('date');
	if (!date) {
		return '';
	}

	var str = '<span class="climbed">Climbed: ' + format_date (date) + '</span><br>';
	return str;
}

function get_date (feature)
{
	if (!feature) {
		return '';
	}

	var date = feature.get ('date');
	if (!date) {
		return '';
	}

	var str = '<span>Date</span> ' + format_date (date) + '<br />';
	return str;
}

function get_date2 (feature)
{
	if (!feature) {
		return '';
	}

	var date = feature.get ('date');
	if (!date) {
		return '';
	}

	var str = format_date (date) + '<br />';
	return str;
}

function get_day_length (feature)
{
	if (!feature) {
		return '';
	}

	var len = feature.get ('day_length');
	if (!len) {
		return '';
	}

	var str = '<span>Walked</span> ' + len + ' miles<br />';
	return str;
}

function get_id (feature, name)
{
	if (!feature || !name) {
		return '';
	}

	var id = feature.getId();
	if (!id) {
		return '';
	}

	var str = '<span><span class="subtle">' + name + '&nbsp;ID</span></span> <span class="subtle">' + id + '</span><br />';
	return str;
}

function get_id2 (feature, name)
{
	if (!feature || !name) {
		return '';
	}

	var id = feature.getId();
	if (!id) {
		return '';
	}

	var str = '<span class="subtle">' + name + '&nbsp;ID ' + id + '</span><br />';
	return str;
}

function get_text (feature, key, title)
{
	if (!feature || !key) {
		return '';
	}

	var str = feature.get (key);
	if (!str) {
		return '';
	}

	var desc = '';
	if (typeof title !== 'undefined') {
		if (title.length === 0) {
			title = '&nbsp;';
		}
		desc += '<span>'+title+'</span> ';
	}

	desc += str + '<br />';
	return desc;
}

function get_bold_name (feature)
{
	if (!feature) {
		return '';
	}

	var str = '';
	var tag = feature.get('tag');
	if (tag == 'start') {
		str = 'Start of the ';
	} else if (tag == 'end') {
		str = 'End of the ';
	}

	var name = feature.get('name');
	if (!name) {
		return '';
	}

	str += name;

	var where = feature.get('where');
	if (where) {
		str += ' - ' + where;
	}

	str = '<h2>' + str + '</h2>';
	return str;
}

function get_location (feature, title)
{
	if (!feature) {
		return '';
	}

	var tag = feature.get('tag');
	if ((tag == 'ferry') || (tag == 'waves')) {
		return '';
	}

	var str    = '';
	var coords = feature.get('coords');
	var elev   = feature.get('elevation');
	var gr     = feature.get('gridref');

	if (gr) {
		str += gr;
	} else {
		str += coords;
	}

	var type = feature.get('type');
	if (elev && (type != 'peak') && str) {
		str += ' (' + elev + 'm)';
	}

	if (str) {
		str += '<br />';
	}

	if (typeof title !== 'undefined') {
		if (title.length === 0) {
			title = '&nbsp;';
		}
		str = '<span>'+title+'</span> ' + str;
	}

	return str;
}

function get_height (feature)
{
	if (!feature) {
		return '';
	}

	var elev = feature.get('elevation');
	if (!elev) {
		return '';
	}

	var str = '<span>Height</span> ' + elev + 'm<br>';
	return str;
}


function estimate_exists (feature)
{
	if (!feature) {
		return false;
	}

	var keys = feature.getKeys();

	var search = [ 'est_wp', 'est_percentage', 'est_latitude', 'est_longitude' ];
	for (var x in search) {
		if (keys.indexOf(search[x]) < 0) {
			return false;
		}
	}

	return true;
}

function create_message (feature)
{
	// "date_seen":      "2015-01-27",
	// "latitude":       51.763237,
	// "longitude":      -1.269080,
	// "percentage":     0,
	// "date_bed":       "",
	// "message":        "",
	// "route":          "",
	// "date_route":     "",
	// "wp":             ""

	// "est_wp":         123,
	// "est_percentage": 75,
	// "est_latitude":   54.699234,
	// "est_longitude":  -3.143848

	var message = '';
	var elapsed = 0;
	var today = new Date();
	var since = null;

	var latitude   = 0;
	var longitude  = 0;
	var percentage = 0;

	var estimate = estimate_exists (feature);

	var date_seen = feature.get('date_seen');
	if (estimate) {
		since = today;
	} else {
		since = new Date(date_seen);
	}

	message += '<h2>Rich';

	if (estimate) {
		message += ' <span class="estimate">(estimated position)</span>';
	} else {
		message += ' <span class="lastseen">(checked in ';
		elapsed = today.diff (date_seen);
		if (elapsed < 1) {
			message += 'today';
		} else if (elapsed < 2) {
			message += 'yesterday';
		} else if (elapsed < 8) {
			message += elapsed + ' days ago';
		} else {
			message += 'on ' + date_seen;
		}
		message += ')</span>';
	}
	message += '</h2>';
	// alert(message);

	if (estimate) {
		percentage = feature.get('est_percentage');
		latitude   = feature.get('est_latitude');
		longitude  = feature.get('est_longitude');
	} else {
		percentage = feature.get('percentage');
		latitude   = feature.get('latitude');
		longitude  = feature.get('longitude');
	}

	var route      = feature.get('route');
	var date_route = feature.get('date_route');

	if (route) {
		if (date_route) {
			var d = since.diff (date_route) + 1;
			message += '<b>Day ' + d + '</b> of the <b>' + route_list[route].fullname + '</b>';

			if (percentage) {
				message += ' (' + percentage + '%)';
			}
		} else {
			message += 'Walking the <b>' + route_list[route].fullname + '</b>';
		}
		message += '<br>';
	} else {
		message += 'Not currently on a route<br>';
	}

	if (latitude && longitude) {
		var lat = parseFloat (latitude);
		var lon = parseFloat (longitude);
		message += '<span class="subtle">lat/long: ' + lat.toFixed(6) + ',' + lon.toFixed(6) + '</span><br>';
	}

	//message += '<br>';

	var date_bed = feature.get('date_bed');
	elapsed = since.diff (date_bed);
	if (elapsed > 7) {
		message += 'Last saw a bed ' + elapsed + ' days ago.<br>';
	}

	var msg = feature.get('message');
	if (msg) {
		message += '<b>&ldquo;' + msg + '&rdquo;</b><br>';
	}

	return message;
}


// -----------------------------------------------------------------------------

function show_area (feature)
{
	// area
	//	todo
	//	done
	//	whole
	//	hull

	// name
	// type
	// tag
	// hike_id
	// hike_dir

	// Climbed:
	// 	24 of the 214 Wainwrights
	// 	7 of the 116 Wainwright Outliers
	// 	34 of the 323 Other hills

	// To Climb:
	// 	190 of the 214 Wainwrights
	// 	109 of the 116 Wainwright Outliers
	// 	289 of the 323 Other hills

	var tag = feature.get ('tag');
	if (tag == 'hull') {
		return true;
	}

	var output = '';

	output += feature.get('name') + '<br>';
	output += feature.get('type') + '<br>';
	output += feature.get('tag') + '<br>';
	output += feature.get('hike_id') + '<br>';
	output += feature.get('hike_dir') + '<br>';

	return output;
}

function show_icon (feature, layer)
{
	// icon
	//	ferry
	//	waves
	//	tent
	//	hut
	//	hotel
	//	start
	//	end

	if (!feature) {
		return '';
	}

	var tag = feature.get ('tag');
	if ((tag == 'start') || (tag == 'end')) {
		show_route_info (feature.get ('route'));
	}

	var output = '<div class="format">';

	var x = feature.getStyle() || layer.getStyle();
	var y = x.getImage();
	var z = y.getSrc();
	var s = y.getSize();

	output += '<div style="' +
		' padding-left: ' + (s[0]+3) + 'px;' +
		' background-image: url(\'' + z + '\');' +
		' background-repeat: no-repeat;' +
		' background-position: left top;' +
		'">';

	output += get_bold_name   (feature);
	output += get_text        (feature, 'description');
	output += get_date2       (feature);
	output += get_location    (feature);
	if (DEBUG) {
		output += get_id2         (feature, 'Icon');
	}

	output += '</div>';
	output += '</div>';

	return output;
}

function show_line (feature)
{
	// line
	//	hike
	//	todo
	//	variant
	//	route
	//	river
	if (!feature) {
		return '';
	}

	var output = '<div class="format">';
	output += get_line_title  (feature);
	output += get_text        (feature, 'description', '');
	output += get_text        (feature, 'name', 'Part of');
	output += get_date        (feature);
	output += get_day_length  (feature);
	if (DEBUG) {
		output += get_id          (feature, 'Line');
	}

	return output;
}

function show_peak (feature)
{
	// peak
	//	done
	//	todo
	if (!feature) {
		return '';
	}

	var output = '';

	output += get_bold_name   (feature);
	output += get_climbed     (feature);
	output += '<br>';

	output += '<div class="format">';

	output += get_height      (feature);
	output += get_text        (feature, 'categories', 'Categories');
	output += get_location    (feature, 'Grid Ref');
	output += get_text        (feature, 'coords',     'Long/Lat');
	output += get_text        (feature, 'dobih',      'DoBIH');
	if (DEBUG) {
		output += get_id  (feature, 'Peak');
	}

	output += '</div>';
	return output;
}

function show_rich (feature, layer)
{
	if (!feature) {
		return '';
	}

	var output = '';

	var x = feature.getStyle() || layer.getStyle();
	var y = x.getImage();
	var z = y.getSrc();
	var s = y.getSize();

	output += '<div style="' +
		' padding-left: ' + (s[0]+3) + 'px;' +
		' background-image: url(\'' + z + '\');' +
		' background-repeat: no-repeat;' +
		' background-position: left top;' +
		'">';

	// alert (feature.getKeys());

	output += create_message (feature);

	// output += '<h2>Where's Rich?</h2>';

	output += 'blah<br>';
	output += 'blah<br>';
	output += 'blah<br>';
	output += 'blah<br>';

	// output += get_bold_name   (feature);
	// output += get_text        (feature, 'description');
	// output += get_date2       (feature);
	// output += get_location    (feature);
	// output += get_id2         (feature, 'Icon');

	output += '</div>';

	return output;
}


// -----------------------------------------------------------------------------

function on_change_hike()
{
	opt_alldone = false;
	var option = this.value;

	if (opt_zoom) {
		map_zoom_route (option);
	}

	if (opt_one) {
		map_clear();
	}
	show_route_info (option);
	load_kml (option);
}

function on_change_map_type()
{
	var opt = this.value;

	$.each (maps, function (index, layer) {
		layer.setVisible (opt == index);
	});
}

function on_click_hike()
{
	opt_alldone = false;
	var option = this.value;

	if (opt_zoom) {
		map_zoom_route (option);
	}
}

function on_map_click (evt)
{
	var coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
	var str = coords[0].toFixed(6) + ', ' + coords[1].toFixed(6);
	$('#ll').html(str);
}

function on_mouse_move(evt)
{
	var pixel = map.getEventPixel (evt.originalEvent);
	var hit = false;

	map.forEachFeatureAtPixel (pixel, function (feature, layer) {
		var tag = feature.get ('tag');
		if (tag == 'hull') {
			return true;
		}

		hit = true;

		var type = feature.get ('type');
		var text;

		if (type == 'area') {
			text = show_area (feature);
		} else if (type == 'icon') {
			text = show_icon (feature, layer);
		} else if (type == 'line') {
			text = show_line (feature);
		} else if (type == 'peak') {
			text = show_peak (feature);
		} else if (type == 'rich') {
			text = show_rich (feature, layer);
		} // XXX else alert

		if (text) {
			item_info.html (text);
		}

		var coords = feature.get('coords') || '';
		$('#ll').html(coords);

		return true;
	});

	var t = $('#map')[0];
	if (hit) {
		t.style.cursor = 'pointer';
	} else {
		t.style.cursor = '';
		// item_info.html ('');
	}
}

function on_window_resize()
{
	map.updateSize();
}


// -----------------------------------------------------------------------------

function get_uk_hull()
{
	var uk_convex_hull = [[
		[ -6.224408, 56.725261 ],
		[ -5.191198, 58.587064 ],
		[ -3.028093, 58.646065 ],
		[ -1.823329, 57.612691 ],
		[  1.781172, 52.562703 ],
		[  1.400427, 51.152562 ],
		[  0.247893, 50.725720 ],
		[ -5.203043, 49.958145 ],
		[ -5.708586, 50.045477 ],
		[ -5.026403, 53.977312 ],
		[ -6.224408, 56.725261 ]
	]];

	var hull = new ol.geom.Polygon (uk_convex_hull);
	hull.transform ('EPSG:4326', 'EPSG:3857');

	return hull;
}


function load_estimate_data (feature)
{
	if (!feature) {
		return;
	}

	$.getJSON ('estimate.json', function (estimate) {
		var pt;

		var lon = parseFloat (estimate.est_longitude);
		var lat = parseFloat (estimate.est_latitude);

		if (!lon || !lat) {
			alert ('bad coords');
			return;
		}

		pt = [lon, lat];
		// alert(pt);

		var f = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.transform(pt, 'EPSG:4326', 'EPSG:3857'))
		});

		var keys = feature.getKeys();
		$.each (keys, function (index, name) {
			if (name == 'geometry') {
				return true;
			}
			// Transfer all the json data from the rich feature
			f.set (name, feature.get(name));
		});

		f.set ('type', 'rich');
		f.set ('tag',  'estimate');

		$.each (estimate, function (name, value) {
			// Transfer all the json data to the feature
			f.set (name, value);
		});

		var l = layers.icon_rich;
		var s = l.getSource();

		f.setStyle (icons.r_yellow);
		s.addFeature(f);
	})
	.fail (function() {
		alert ('Couldn\'t load Rich\'s estimated position');
	});
}

function load_kml (route)
{
	var proj = ol.proj.get ('EPSG:3857');
	var load;
	var key;

	var url = 'output/'+route+'.kml';
	load = new ol.source.KML({
		projection: proj,
		url: url,
		extractStyles: false,
	});

	key = load.on ('change', function() {
		var state = load.getState();
		if (state == 'ready') {
			load.forEachFeature (function (feature) {
				var type = feature.get ('type');
				var tag  = feature.get ('tag');
				if (!type || !tag) {
					return false;
				}

				var l = type + '_' + tag;
				var layer = layers[l] || layers.extra;

				var id = feature.getId();
				var src = layer.getSource();
				if (id) {
					if (src.getFeatureById (id)) {
						return false;
					}
				}
				var clone = feature.clone();
				clone.setId (id);

				var name;
				if (layer == layers.extra) {
					name = feature.get ('set_name');
					if (name.substring (0, 5) == 'todo_') {
						clone.setStyle (icons.red_x);
					} else {
						clone.setStyle (icons.green_x);
					}
				}
				if (type == 'icon') {
					name = feature.get('name');
					if (name == 'Camp site') {
						clone.setStyle (icons.site);
					}
				}

				src.addFeature (clone);
			});

			load.unByKey (key);
			load = null;
			if (opt_zoom) {
				map_zoom_route (route);
			}
		} else {
			alert (state + ': loading "' + route + '"');
		}
	});
}

function load_rich_data()
{
	$.getJSON ('rich.json', function (rich) {
		// alert (rich.longitude);
		// alert (rich.latitude);

		var pt;

		var lon = parseFloat (rich.longitude);
		var lat = parseFloat (rich.latitude);

		if (!lon || !lat) {
			alert ('bad coords');
			return;
		}

		pt = [lon, lat];

		var f = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.transform(pt, 'EPSG:4326', 'EPSG:3857'))
		});

		$.each (rich, function (name, value) {
			// Transfer all the json data to the feature
			f.set (name, value);
		});

		f.set ('type', 'rich');
		f.set ('tag',  'seen');

		var l = layers.icon_rich;
		var s = l.getSource();
		s.addFeature(f);

		load_estimate_data(f);
	})
	.fail (function() {
		alert ('Couldn\'t load Rich\'s location data');
	});
}

function load_route_data()
{
	$.getJSON ('output/routes.json', function (data) {
		route_list = data;
		init_dropdown();
	})
	.fail (function() {
		alert ('Couldn\'t load route data');
	});
}


//------------------------------------------------------------------------------

function init_bind_controls()
{
	var names = [ 'line_hike', 'line_river', 'line_route', 'line_todo', 'line_variant', 'icon_end', 'icon_ferry',
		      'icon_hotel', 'icon_hut', 'icon_rich', 'icon_start', 'icon_tent', 'icon_waves', 'peak_done',
		      'peak_todo', 'area_done', 'area_todo', 'area_whole', 'extra' ];

	var len = names.length;
	for (var i = 0; i < len; i++) {
		var name = names[i];
		var control = new ol.dom.Input (document.getElementById (name));
		control.bindTo ('checked', layers[name], 'visible');
	}
}

function init_dropdown()
{
	var c = [];
	var i = [];
	var u = [];
	var h = [];
	var j = [];

	var c_html = '';
	var i_html = '';
	var u_html = '';
	var h_html = '';
	var j_html = '';

	$.each (route_list, function (index, route) {
		if ((typeof (route.dist_route) !== undefined) && (route.dist_route > 0)) {
			if (typeof (route.complete) !== undefined) {
				if (route.complete == 100) {
					if (index.substring (0, 5) == 'join.') {
						j.push ({ key: index, fullname: route.fullname });
					} else {
						c.push ({ key: index, fullname: route.fullname });
					}
				} else if (route.complete > 0) {
					i.push ({ key: index, fullname: route.fullname  + ' (' + route.complete + '%)' });
				} else {
					u.push ({ key: index, fullname: route.fullname });
				}
			}
		} else {
			h.push ({ key: index, fullname: route.fullname  + ' (' + route.complete + '%)' });
		}
	});

	c.sort (route_sort);
	i.sort (route_sort);
	u.sort (route_sort);
	h.sort (route_sort);
	j.sort (route_sort);

	if (c.length) {
		c_html += '<optgroup id="complete" label="Complete">';
		$.each (c, function (index, route) {
			c_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		c_html += '</optgroup>';
	}

	if (i.length) {
		i_html += '<optgroup id="incomplete" label="Incomplete">';
		$.each (i, function (index, route) {
			i_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		i_html += '</optgroup>';
	}

	if (u.length) {
		u_html += '<optgroup id="unstarted" label="Unstarted">';
		$.each (u, function (index, route) {
			u_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		u_html += '</optgroup>';
	}

	if (h.length) {
		h_html += '<optgroup id="hills" label="Hills">';
		$.each (h, function (index, route) {
			h_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		h_html += '</optgroup>';
	}

	if (j.length) {
		j_html += '<optgroup id="join" label="Join Ups">';
		$.each (j, function (index, route) {
			j_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		j_html += '</optgroup>';
	}

	show_html.comp = c_html;
	show_html.inco = i_html;
	show_html.unst = u_html;
	show_html.hill = h_html;
	show_html.join = j_html;

	return dd_populate();
}

function init_events()
{
	$('#show_comp').change (function() { show_comp = this.checked; dd_populate(); });
	$('#show_hill').change (function() { show_hill = this.checked; dd_populate(); });
	$('#show_inco').change (function() { show_inco = this.checked; dd_populate(); });
	$('#show_join').change (function() { show_join = this.checked; dd_populate(); });
	$('#show_unst').change (function() { show_unst = this.checked; dd_populate(); });

	$('#opt_one')  .change (function() { opt_one  = this.checked; });
	$('#opt_zoom') .change (function() { opt_zoom = this.checked; });

	$('input[name=map_type]').change (on_change_map_type);

	$('#button_centre') .click (function() { map_zoom_route(); });
	$('#button_done')   .click (function() { map_show_all();   });
	$('#button_clear')  .click (function() { map_reset();      });
	$('#button_options').click (function() { $('#dialog').dialog ({ width: 450 }); });

	$('#dropdown').change (on_change_hike);
	$('#dropdown').click (on_click_hike);

	$(map.getViewport()).on ('mousemove', on_mouse_move);
	map.on('click', on_map_click);
	$(window).on ('resize', on_window_resize);
}

function init_options()
{
	$('#show_comp').prop ('checked', show_comp);
	$('#show_inco').prop ('checked', show_inco);
	$('#show_unst').prop ('checked', show_unst);
	$('#show_hill').prop ('checked', show_hill);
	$('#show_join').prop ('checked', show_join);

	$('#opt_one')  .prop ('checked', opt_one);
	$('#opt_zoom') .prop ('checked', opt_zoom);
}


//------------------------------------------------------------------------------

function init_map_area_styles()
{
	areas.done = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [0, 255, 0, 0.2]
		}),
		stroke: new ol.style.Stroke({
			color: '#00FF00',
			width: 2
		})
	});
	areas.hull = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#00FFFF',
			width: 2
		})
	});
	areas.todo = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [255, 0, 0, 0.2]
		}),
		stroke: new ol.style.Stroke({
			color: '#FF0000',
			width: 2
		})
	});
	areas.whole = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [255, 255, 0, 0.2]
		}),
		stroke: new ol.style.Stroke({
			color: '#FFFF00',
			width: 2
		})
	});
}

function init_map_icons()
{
	var names = {
		// Map tags to filenames
		'end':       'paddle_end',
		'ferry':     'map_ferry',
		'hotel':     'map_hotel',
		'hut':       'map_hut',
		'peak_done': 'diamond_green',
		'peak_todo': 'diamond_red',
		'r_green':   'r_green',
		'r_red':     'r_red',
		'r_yellow':  'r_yellow',
		'start':     'paddle_start',
		'tent':      'map_tent',
		'site':      'map_site',
		'waves':     'map_waves',
		'red_x':     'red_cross',
		'green_x':   'green_cross',
	};

	$.each (names, function (name, filename) {
		var scale = 0.5;
		if ((name == 'start') || (name == 'end') || (name == 'red_x') || (name == 'green_x')) {
			scale = 1.0;
		}

		var ax = 0.5;
		var ay = 1.0;

		if ((name == 'red_x') || (name == 'green_x')) {
			scale = 0.75;
			ax = 0.5;
			ay = 0.5;
		}

		if ((name == 'r_green') || (name == 'r_yellow') || (name == 'r_red')) {
			scale = 1.0;
		}

		var icon = new ol.style.Icon({
			anchor: [ax, ay],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			src: 'gfx/'+filename+'.png',
			scale: scale
		});

		icons[name] = new ol.style.Style({
			image: icon
		});
	});
}

function init_map_layers()
{
	// Route layers								    Default Line Style
	layers.line_hike    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: styles.hike     });
	layers.line_river   = new ol.layer.Vector ({ source: new ol.source.Vector(), style: styles.river    });
	layers.line_route   = new ol.layer.Vector ({ source: new ol.source.Vector(), style: styles.route    });
	layers.line_todo    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: styles.todo     });
	layers.line_variant = new ol.layer.Vector ({ source: new ol.source.Vector(), style: styles.variant  });

	// Icon layers								    Default Icon
	layers.icon_end     = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.end       });
	layers.icon_ferry   = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.ferry     });
	layers.icon_hotel   = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.hotel     });
	layers.icon_hut     = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.hut       });
	layers.icon_rich    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.r_green   });
	layers.icon_start   = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.start     });
	layers.icon_tent    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.tent      });
	layers.icon_waves   = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.waves     });
	layers.peak_done    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.peak_done });
	layers.peak_todo    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: icons.peak_todo });

	// Areas								    Default Area Styles
	layers.area_done    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: areas.done      });
	layers.area_hull    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: areas.hull      });
	layers.area_todo    = new ol.layer.Vector ({ source: new ol.source.Vector(), style: areas.todo      });
	layers.area_whole   = new ol.layer.Vector ({ source: new ol.source.Vector(), style: areas.whole     });

	// Misc									    No Defaults
	layers.extra        = new ol.layer.Vector ({ source: new ol.source.Vector()                         });
}

function init_map_line_styles()
{
	styles.route = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#FF00FF',
			width: 2
		})
	});
	styles.variant = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#FFFF00',
			width: 2
		})
	});
	styles.river = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#00FFFF',
			width: 2
		})
	});
	styles.todo = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#FF0000',
			width: 2
		})
	});
	styles.hike = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#00FF00',
			width: 2
		})
	});
}

function init_map_maps()
{
	maps.aerial = new ol.layer.Tile({
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'Aerial',
		}),
		visible: true,
	});

	maps.hybrid = new ol.layer.Tile({
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'AerialWithLabels',
		}),
		visible: false,
	});

	maps.street = new ol.layer.Tile({
		source: new ol.source.OSM(),
		visible: false,
	});

	maps.os = new ol.layer.Group({
		layers: [
			new ol.layer.Tile({
				source: new ol.source.BingMaps({
					key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
					imagerySet: 'ordnanceSurvey',
				}),
				minResolution: 1.18,
				maxResolution: 40,
			}),
			new ol.layer.Tile({
				source: new ol.source.OSM(),
				minResolution: 40,
				maxResolution: 20000,
			})
		],
		visible: false,
	});

	maps.pastel = new ol.layer.Tile({
		source: new ol.source.Stamen({
			layer: 'watercolor'
		}),
		visible: false,
	});

	maps.toner = new ol.layer.Tile({
		source: new ol.source.Stamen({
			layer: 'toner-background'
		}),
		visible: false,
	});

	maps.black = new ol.layer.Tile({
		source: new ol.source.TileJSON({
			url: 'http://api.tiles.mapbox.com/v3/mapbox.world-black.jsonp',
		}),
		visible: false,
	});
}

function init_map()
{
	init_map_area_styles();
	init_map_icons();
	init_map_maps();
	init_map_line_styles();
	init_map_layers();

	map = new ol.Map({
		target: 'map',
		layers: [
			// Layers grouped by depth
			layers.area_hull,
			maps.aerial, maps.hybrid, maps.street, maps.os, maps.pastel, maps.toner, maps.black,
			layers.area_whole, layers.area_todo, layers.area_done,
			layers.line_route, layers.line_variant,
			layers.line_river, layers.icon_ferry, layers.icon_waves,
			layers.line_todo, layers.peak_todo,
			layers.line_hike, layers.peak_done,
			layers.icon_hotel, layers.icon_hut, layers.icon_tent,
			layers.icon_end, layers.icon_start, layers.extra,
			layers.icon_rich,
		],
		view: new ol.View({
			center: ol.proj.transform ([-3.143848, 54.699234], 'EPSG:4326', 'EPSG:3857'),
			zoom: 6,
			minZoom: 1,
			maxZoom: 19,
		}),
		controls: ol.control.defaults().extend ([
			new ol.control.FullScreen()
		]),
	});
}


// -----------------------------------------------------------------------------

function main()
{
	$('body').layout({
		east__size: 400,
		east__minSize: 250,
		north__resizable: false,
		north__closable: false,
		center__onresize: function() { map.updateSize(); }
	});
	init_map();
	init_options();
	init_events();
	init_bind_controls();

	map.updateSize();

	load_route_data();

	$('#tabs').tabs();

	uk_hull = get_uk_hull();

	route_info = $('#route_info');
	item_info = $('#item_info');

	set_defaults();
	load_rich_data();
}


$(main);

