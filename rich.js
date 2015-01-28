/**
 * Copyright (c) 2013-2014 Richard Russon (flatcap)
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

			// Show list of:
var show_comp   = true;		// Completed routes
var show_inco   = true;		// Incomplete routes
var show_unst   = false;	// Unstarted routes
var show_hill   = true;		// Sets of hills
var show_join   = true;		// Non-route joins

var show_html = {	// Keep the select HTML to rebuild the dropdown
	comp: "",		// Completed routes
	inco: "",		// Incomplete routes
	unst: "",		// Unstarted routes
	hill: "",		// Sets of hills
	join: ""		// Non-route joins
};

var map;

if (!('contains' in String.prototype)) {
	String.prototype.contains = function(str) {
		return ''.indexOf.call(this, str, 0) !== -1;
	};
}

function init_map()
{
	var bing = new ol.layer.Tile({
		source: new ol.source.BingMaps({
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
			imagerySet: 'Aerial',
		})
	});

	var route = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: [ new ol.Feature({
				'geometry': new ol.geom.LineString([
						ol.proj.transform([0.469667,54.199919], 'EPSG:4326', 'EPSG:3857'),
						ol.proj.transform([-2.408751,56.193443], 'EPSG:4326', 'EPSG:3857')
				])
			}) ]
		}),
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#FF00FF',
				width: 4
			})
		})
	});

	var alternate = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: [ new ol.Feature({
				'geometry': new ol.geom.LineString([
						ol.proj.transform([-2.584533,52.387873], 'EPSG:4326', 'EPSG:3857'),
						ol.proj.transform([0.513612,55.240489], 'EPSG:4326', 'EPSG:3857')
				])
			}) ]
		}),
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#FFFF00',
				width: 4
			})
		})
	});

	var ferry = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: [ new ol.Feature({
				'geometry': new ol.geom.LineString([
						ol.proj.transform([-4.715880,53.708610], 'EPSG:4326', 'EPSG:3857'),
						ol.proj.transform([-0.650939,52.508400], 'EPSG:4326', 'EPSG:3857')
				])
			}) ]
		}),
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#00FFFF',
				width: 4
			})
		})
	});

	var todo = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: [ new ol.Feature({
				'geometry': new ol.geom.LineString([
						ol.proj.transform([-3.199767,55.812581], 'EPSG:4326', 'EPSG:3857'),
						ol.proj.transform([-3.727111,52.535139], 'EPSG:4326', 'EPSG:3857')
				])
			}) ]
		}),
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#FF0000',
				width: 4
			})
		})
	});

	var hike = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: [ new ol.Feature({
				'geometry': new ol.geom.LineString([
						ol.proj.transform([-0.782775,56.058728], 'EPSG:4326', 'EPSG:3857'),
						ol.proj.transform([-5.221251,54.251300], 'EPSG:4326', 'EPSG:3857')
				])
			}) ]
		}),
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#00FF00',
				width: 4
			})
		})
	});

	map = new ol.Map({
		target: 'map',
		layers: [ bing, route, alternate, ferry, todo, hike ],
		view: new ol.View({
			center: ol.proj.transform([-3.143848, 54.699234], 'EPSG:4326', 'EPSG:3857'),
			zoom: 6
		})
	});
}

/**
 * init_options - Set the default checkbox values
 *
 * Set some sensible defaults for the checkboxes.
 */
function init_options()
{
	$("#show_comp").prop('checked', show_comp);
	$("#show_inco").prop('checked', show_inco);
	$("#show_unst").prop('checked', show_unst);
	$("#show_hill").prop('checked', show_hill);
	$("#show_join").prop('checked', show_join);
}


/**
 * route_sort - Sort two route_list items by fullname
 * @a: Item 1
 * @b: Item 2
 *
 * Sort helper function.
 * Sort the route_list by fullname.
 *
 * Return: -1	a precedes b
 *	    0	a identical to b
 *	    1	a follows b
 */
function route_sort(a,b)
{
	if (a.fullname > b.fullname) {
		return 1;
	} else if (a.fullname < b.fullname) {
		return -1;
	} else {
		return 0;
	}
}


/**
 * dd_init - Create HTML for dropdown
 *
 * Create the HTML for the dropdown from the route_list.
 *
 * Return: DOM select object
 */
function dd_init()
{
	var c = [];
	var i = [];
	var u = [];
	var h = [];
	var j = [];

	var c_html = "";
	var i_html = "";
	var u_html = "";
	var h_html = "";
	var j_html = "";

	$.each(route_list, function(index, route) {
		if ((typeof(route.dist_route) !== undefined) && (route.dist_route > 0)) {
			if (typeof(route.complete) !== undefined) {
				if (route.complete == 100) {
					if (route.attr.contains ('j')) {
						j.push ({ key: index, fullname: route.fullname });
					} else {
						c.push ({ key: index, fullname: route.fullname });
					}
				} else if (route.complete > 0) {
					i.push ({ key: index, fullname: route.fullname  + " (" + route.complete + "%)" });
				} else {
					u.push ({ key: index, fullname: route.fullname });
				}
			}
		} else {
			h.push ({ key: index, fullname: route.fullname  + " (" + route.complete + "%)" });
		}
	});

	c.sort(route_sort);
	i.sort(route_sort);
	u.sort(route_sort);
	h.sort(route_sort);
	j.sort(route_sort);

	var x;

	if (c.length) {
		c_html += '<optgroup id="complete" label="Complete">';
		$.each(c, function(index, route) {
			c_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		c_html += '</optgroup>';
	}

	if (i.length) {
		i_html += '<optgroup id="incomplete" label="Incomplete">';
		$.each(i, function(index, route) {
			i_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		i_html += '</optgroup>';
	}

	if (u.length) {
		u_html += '<optgroup id="unstarted" label="Unstarted">';
		$.each(u, function(index, route) {
			u_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		u_html += '</optgroup>';
	}

	if (h.length) {
		h_html += '<optgroup id="hills" label="Hills">';
		$.each(h, function(index, route) {
			h_html += '<option value="' + route.key +'">' + route.fullname + '</option>';
		});
		h_html += '</optgroup>';
	}

	if (j.length) {
		j_html += '<optgroup id="join" label="Join Ups">';
		$.each(j, function(index, route) {
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

/**
 * dd_populate - Populate the dropdown box
 *
 * Dropdown contents depend on four bools (show_*).
 * After the rebuild, try to keep the previous selected item.
 *
 * Return: DOM select object
 */
function dd_populate()
{
	var dd = $("#dropdown");
	var value = dd.value;
	var html = "";

	if (show_comp) html += show_html.comp;
	if (show_inco) html += show_html.inco;
	if (show_unst) html += show_html.unst;
	if (show_hill) html += show_html.hill;
	if (show_join) html += show_html.join;

	dd.html(html);

	// If possible, leave the selection unchanged
	dd_select (value);

	return dd;
}

/**
 * dd_select - Pick a dropdown entry by value
 * @route: Name of the route
 *
 * Select entry in dropdown by route name
 */
function dd_select (route)
{
	$("#dropdown").val(route);
}


/**
 * on_hike - Event handler for hike dropdown
 * @id: ID of dropdown
 *
 * When the user selects a different hike, display it.
 */
function on_hike (id)
{
	var option = $("#"+id).val();

	// show_route (option);
}


var route_list;
$.getJSON("rich.json", function(data) {
	route_list = data.routes;
	if (!route_list) {
		alert ("'routes' doesn't exist in data file");
		return;
	}

	// alert (Object.keys(routes).length + " routes");
	dd_init();
})
.fail(function() {
	alert("Couldn't load route data");
});

init_map();
init_options();

/**
 * on_show - Event hander for route list display options
 * @id: ID of checkbox
 *
 * Toggle whether a class of routes is displayed in the dropdown.
 * The use can choose any, or none of:
 *	Completed routes
 *	Incomplete routes
 *	Unstarted routes
 *	Sets of hills
 *	Join Up routes
 */
function on_show (id)
{
	var dd = dd_populate();

	for (var r in route_list) {
		var complete = 0;
		var dist_route = 0;
		var route = false;
		var attr = route_list[r].attr;

		if ("complete" in route_list[r]) {
			complete = route_list[r].complete;
		}
		if ("dist_route" in route_list[r]) {
			dist_route = route_list[r].dist_route;
		}
		if (attr.contains ('r')) {
			route = true;
		}

		if (!show_comp && route && (complete == 100)) {
			hide_route (r);
		}
		if (!show_inco && route && (complete < 100)) {
			hide_route (r);
		}
		if (!show_unst && route && (complete === 0)) {
			hide_route (r);
		}
		if (!show_join && !route && (complete == 100) && (dist_route > 0)) {
			hide_route (r);
		}
		if (!show_hill && !route && (dist_route === 0)) {
			hide_route (r);
		}
	}

	if (opt_one) {
		hide_other_routes (dd.value);
	}
}


$('#show_comp').change(function() { show_comp = this.checked; on_show (this.id); });
$('#show_inco').change(function() { show_inco = this.checked; on_show (this.id); });
$('#show_unst').change(function() { show_unst = this.checked; on_show (this.id); });
$('#show_hill').change(function() { show_hill = this.checked; on_show (this.id); });
$('#show_join').change(function() { show_join = this.checked; on_show (this.id); });

var layers = map.getLayers();

var kml_hike    = new ol.dom.Input(document.getElementById('kml_hike'));    kml_hike.bindTo    ('checked', layers.item(5), 'visible');
var kml_todo    = new ol.dom.Input(document.getElementById('kml_todo'));    kml_todo.bindTo    ('checked', layers.item(4), 'visible');
var kml_ferry   = new ol.dom.Input(document.getElementById('kml_ferry'));   kml_ferry.bindTo   ('checked', layers.item(3), 'visible');
var kml_variant = new ol.dom.Input(document.getElementById('kml_variant')); kml_variant.bindTo ('checked', layers.item(2), 'visible');
var kml_route   = new ol.dom.Input(document.getElementById('kml_route'));   kml_route.bindTo   ('checked', layers.item(1), 'visible');

