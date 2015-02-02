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

/**
 * String.contains - Does the string contain this character
 * @key: Character to look for
 *
 * Extend the String class with a "contains" method.
 * Search the string for a given character.
 *
 * Return: boolean
 */
String.prototype.contains = function (key)
{
	return (this.indexOf (key) >= 0);
};

var map;
var route_list;
var proj= ol.proj.get("EPSG:3857");

var maps   = {};
var layers = {};
var styles = {};
var icons  = {};
var areas  = {};

function map_create_area_styles()
{
	areas.todo = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [255, 150, 150, 0.3]
		}),
		// stroke: new ol.style.Stroke({
		// 	color: "#FF0000",
		// 	width: 1
		// })
	});
	areas.done = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [150, 255, 150, 0.3]
		}),
		// stroke: new ol.style.Stroke({
		// 	color: "#00FF00",
		// 	width: 1
		// })
	});
	areas.whole = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [255, 255, 150, 0.3]
		}),
		// stroke: new ol.style.Stroke({
		// 	color: "#FFFF00",
		// 	width: 1
		// })
	});
}

function map_create_icons()
{
	var names = {
		// Map tags to filenames
		"end":       "paddle_end",
		"ferry":     "map_ferry",
		"hotel":     "map_hotel",
		"hut":       "map_hut",
		"peak_done": "diamond_green",
		"peak_todo": "diamond_red",
		"r_green":   "r_green",
		"r_red":     "r_red",
		"r_yellow":  "r_yellow",
		"start":     "paddle_start",
		"tent":      "map_tent",
		"waves":     "map_waves",
	};

	$.each(names, function(name, filename) {
		var scale = 0.5;
		if ((name == "start") || (name == "end")) {
			scale = 1.0;
		}

		var icon = new ol.style.Icon({
			anchor: [0.5, 1.0],
			anchorXUnits: "fraction",
			anchorYUnits: "fraction",
			src: "gfx/"+filename+".png",
			scale: scale
		});

		icons[name] = new ol.style.Style({
			image: icon
		});
	});
}

function map_create_layers()
{
	// Route layers								  Default Line Style
	layers.hike       = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.hike     });
	layers.river      = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.river    });
	layers.route      = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.route    });
	layers.todo       = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.todo     });
	layers.variant    = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.variant  });

	// Icon layers	         						  Default Icon
	layers.ferry      = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.ferry     });
	layers.end        = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.end       });
	layers.hotel      = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.hotel     });
	layers.hut        = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.hut       });
	layers.peak_done  = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.peak_done });
	layers.peak_todo  = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.peak_todo });
	layers.rich       = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.r_green   });
	layers.start      = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.start     });
	layers.tent       = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.tent      });
	layers.waves      = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.waves     });

	// Areas	         						  Default Area Styles
	layers.area_done  = new ol.layer.Vector({ source: new ol.source.Vector(), style: areas.done      });
	layers.area_todo  = new ol.layer.Vector({ source: new ol.source.Vector(), style: areas.todo      });
	layers.area_whole = new ol.layer.Vector({ source: new ol.source.Vector(), style: areas.whole     });

	// Misc		        						  No Defaults
	layers.extra      = new ol.layer.Vector({ source: new ol.source.Vector()                         });

	// Groups
	layers.group_area = new ol.layer.Group({
		layers: [ layers.area_whole, layers.area_todo, layers.area_done ]
	});
	layers.group_camp = new ol.layer.Group({
		layers: [ layers.hotel, layers.hut, layers.tent ]
	});
	layers.group_done = new ol.layer.Group({
		layers: [ layers.hike, layers.peak_done ]
	});
	layers.group_map = new ol.layer.Group({
		layers: [ maps.bing, maps.osm, maps.terrain, maps.stamen ]
	});
	layers.group_todo = new ol.layer.Group({
		layers: [ layers.todo, layers.peak_todo ]
	});
	layers.group_water = new ol.layer.Group({
		layers: [ layers.river, layers.ferry, layers.waves ]
	});
}

function map_create_line_styles()
{
	styles.route = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#FF00FF",
			width: 2
		})
	});
	styles.variant = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#FFFF00",
			width: 2
		})
	});
	styles.river = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#00FFFF",
			width: 2
		})
	});
	styles.todo = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#FF0000",
			width: 2
		})
	});
	styles.hike = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#00FF00",
			width: 2
		})
	});
}

function map_create_maps()
{
	maps.bing = new ol.layer.Tile({
		source: new ol.source.BingMaps({
			key: "Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3",
			imagerySet: "Aerial",		// 1-19
			// imagerySet: "Road",			// 5-18 (0-4 = country outlines)
			// imagerySet: "AerialWithLabels",	// 5-19 (0-4\ =\ country\ outlines)
			// imagerySet: "collinsBart",		// 10-13 (terrain-ish)
			// imagerySet: "ordnanceSurvey",	// 10-11 (fuzzy), 12-14 (1:50), 15-17 (1:25)
		}),
		visible: true,
	});

	// OSM StreetView : 5-19 (0-4 = country outlines)
	maps.osm = new ol.layer.Tile({
		source: new ol.source.OSM(),
		visible: false,
	});

	// Mapbox : Terrain: 0-6
	maps.terrain = new ol.layer.Tile({
		source: new ol.source.TileJSON({
			url: "http://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.jsonp",
			// url: "http://api.tiles.mapbox.com/v3/mapbox.world-black.jsonp",	// silhouette : 1-13
		}),
		visible: false,
	});

	maps.stamen = new ol.layer.Tile({
		source: new ol.source.Stamen({
			layer: "watercolor"		// Pastels: 1-17
			// layer: "toner"			// Black/white: 0-19
			// layer: "toner-background"		// Black/white (no-labels): 0-19
			// layer: "toner-lines"			// Black/white (labels only): 0-19
		}),
		visible: false,
	});
}

function map_init()
{
	map_create_area_styles();
	map_create_icons();
	map_create_maps();
	map_create_line_styles();
	map_create_layers();

	map = new ol.Map({
		target: "map",
		layers: [
			// Layers grouped by depth
			layers.group_map, layers.group_area,
			layers.route, layers.variant,
			layers.group_water, layers.group_todo, layers.group_done,
			layers.group_camp, layers.start, layers.end, layers.extra,
			layers.rich
		],
		view: new ol.View({
			center: ol.proj.transform([-3.143848, 54.699234], "EPSG:4326", "EPSG:3857"),
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
	$("#show_comp").prop("checked", show_comp);
	$("#show_inco").prop("checked", show_inco);
	$("#show_unst").prop("checked", show_unst);
	$("#show_hill").prop("checked", show_hill);
	$("#show_join").prop("checked", show_join);

	$("#show_comp").change(function() { show_comp = this.checked; on_show (this.id); });
	$("#show_inco").change(function() { show_inco = this.checked; on_show (this.id); });
	$("#show_unst").change(function() { show_unst = this.checked; on_show (this.id); });
	$("#show_hill").change(function() { show_hill = this.checked; on_show (this.id); });
	$("#show_join").change(function() { show_join = this.checked; on_show (this.id); });

	$("#global_centre").click(function() { map_zoom_route(); });
	$("#global_done")  .click(function() { alert("done");    });
	$("#global_todo")  .click(function() { alert("todo");    });
	$("#global_clear") .click(function() { map_clear();      });

	var kml_done    = new ol.dom.Input(document.getElementById("kml_done"));    kml_done.bindTo    ("checked", layers.group_done,  "visible");
	var kml_route   = new ol.dom.Input(document.getElementById("kml_route"));   kml_route.bindTo   ("checked", layers.route,       "visible");
	var kml_todo    = new ol.dom.Input(document.getElementById("kml_todo"));    kml_todo.bindTo    ("checked", layers.group_todo,  "visible");
	var kml_variant = new ol.dom.Input(document.getElementById("kml_variant")); kml_variant.bindTo ("checked", layers.variant,     "visible");
	var kml_water   = new ol.dom.Input(document.getElementById("kml_water"));   kml_water.bindTo   ("checked", layers.group_water, "visible");

	var kml_area    = new ol.dom.Input(document.getElementById("kml_area"));    kml_area.bindTo    ("checked", layers.group_area,  "visible");
	var kml_camp    = new ol.dom.Input(document.getElementById("kml_camp"));    kml_camp.bindTo    ("checked", layers.group_camp,  "visible");
	var kml_end     = new ol.dom.Input(document.getElementById("kml_end"));     kml_end.bindTo     ("checked", layers.end,         "visible");
	var kml_extra   = new ol.dom.Input(document.getElementById("kml_extra"));   kml_extra.bindTo   ("checked", layers.extra,       "visible");
	var kml_start   = new ol.dom.Input(document.getElementById("kml_start"));   kml_start.bindTo   ("checked", layers.start,       "visible");

	var resolution = new ol.dom.Input(document.getElementById("resolution"));
	resolution.bindTo("value", map.getView(), "resolution").transform(parseFloat, String);
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
					if (index.substring(0, 5) == "join.") {
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

	if (c.length) {
		c_html += "<optgroup id='complete' label='Complete'>";
		$.each(c, function(index, route) {
			c_html += "<option value='" + route.key +"'>" + route.fullname + "</option>";
		});
		c_html += "</optgroup>";
	}

	if (i.length) {
		i_html += "<optgroup id='incomplete' label='Incomplete'>";
		$.each(i, function(index, route) {
			i_html += "<option value='" + route.key +"'>" + route.fullname + "</option>";
		});
		i_html += "</optgroup>";
	}

	if (u.length) {
		u_html += "<optgroup id='unstarted' label='Unstarted'>";
		$.each(u, function(index, route) {
			u_html += "<option value='" + route.key +"'>" + route.fullname + "</option>";
		});
		u_html += "</optgroup>";
	}

	if (h.length) {
		h_html += "<optgroup id='hills' label='Hills'>";
		$.each(h, function(index, route) {
			h_html += "<option value='" + route.key +"'>" + route.fullname + "</option>";
		});
		h_html += "</optgroup>";
	}

	if (j.length) {
		j_html += "<optgroup id='join' label='Join Ups'>";
		$.each(j, function(index, route) {
			j_html += "<option value='" + route.key +"'>" + route.fullname + "</option>";
		});
		j_html += "</optgroup>";
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

	if (show_comp) { html += show_html.comp; }
	if (show_inco) { html += show_html.inco; }
	if (show_unst) { html += show_html.unst; }
	if (show_hill) { html += show_html.hill; }
	if (show_join) { html += show_html.join; }

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
 * map_zoom_ll - Zoom in on coordinates
 * @lat: Latitude
 * @lon: Longitude
 * @zoom: Zoom level (1 = From space, 17 = grass level)
 *
 * Centre the map on the coordinates: (@lat, @lon).
 * Zoom in to the level @zoom.
 */
function map_zoom_ll (lat, lon, zoom)
{
	if (!lat || !lon || !zoom) {
		return false;
	}

	lat = +lat;	// make sure we're dealing with numbers
	lon = +lon;

	// bounds of UK
	if ((lat < 49) || (lat > 59)) {
		return false;
	}

	if ((lon < -8) || (lon > 2)) {
		return false;
	}

	var place = ol.proj.transform([lon, lat], "EPSG:4326", "EPSG:3857");
	var view = map.getView();

	view.setCenter (place);
	view.setZoom (zoom);

	return true;
}

/**
 * map_zoom_route - Frame a route in the map
 * @route: Route name
 *
 * Centre the map on @route and zoom in.
 * The data come from:
 *	route_list[@route].latitude
 *	route_list[@route].longitude
 *	route_list[@route].zoom
 */
function map_zoom_route (route)
{
	var lat;
	var lon;
	var zoom;

	// alert(route);
	if (route in route_list) {
		lat  = route_list[route].latitude;
		lon  = route_list[route].longitude;
		zoom = route_list[route].zoom;
	}

	// alert(lat);
	// alert(lon);
	// alert(zoom);

	if (lat && lon && zoom) {
		map_zoom_ll (lat, lon, zoom);
	} else {
		map_zoom_ll (54.699234, -3.143848, 6);	// UK
	}
}


/**
 * show_route - Display/hide a route on the map
 * @route: Route name
 *
 * For a given route, display its data on the map.
 * Take into account the global options kml[*].
 *
 * route_list[@route].attr tells us what kml exists.
 * kml[*] tells us what the use wants displayed.
 *
 * Use show_kml(), hide_kml() to do the work.
 */
function show_route (route)
{
	// if (!(route in route_list)) {
	// 	return;
	// }

	// if (opt_one) {
	// 	hide_other_routes (route);
	// }

	// var attr  = route_list[route].attr;
	// var hill  = !(("dist_route" in route_list[route]) && (route_list[route].dist_route > 0));
	// var extra = (!hill) || (kml.extra === true);
	// var hike  = false;
	// var todo  = false;
	// var ferry = false;
	// var walked = false;

	// if ((kml.start === true) && attr.contains ("s")) {
	// 	show_kml (route, "start");
	// } else {
	// 	hide_kml (route, "start");
	// }

	// if ((kml.end === true) && attr.contains ("e")) {
	// 	show_kml (route, "end");
	// } else {
	// 	hide_kml (route, "end");
	// }

	// if (hill) {
	// 	if ((kml.hike === true) && attr.contains ("P")) {
	// 		show_kml (route, "hills_done");
	// 	} else {
	// 		hide_kml (route, "hills_done");
	// 	}

	// 	if ((kml.todo === true) && attr.contains ("p")) {
	// 		show_kml (route, "hills_todo");
	// 	} else {
	// 		hide_kml (route, "hills_todo");
	// 	}

	// 	if ((kml.area === true) && kml.hike && attr.contains ("A")) {
	// 		show_kml (route, "area_done");
	// 	} else {
	// 		hide_kml (route, "area_done");
	// 	}

	// 	if ((kml.area === true) && kml.todo && attr.contains ("a")) {
	// 		show_kml (route, "area_todo");
	// 	} else {
	// 		hide_kml (route, "area_todo");
	// 	}
	// } else {
	// 	if ((kml.variant === true) && attr.contains ("v")) {
	// 		show_kml (route, "variant");
	// 	} else {
	// 		hide_kml (route, "variant");
	// 	}
	// }

	// if (attr.contains ("x") && ("custom" in route_list[route])) {
	// 	var list = route_list[route].custom.split(",");
	// 	var i;
	// 	if (kml.extra === true) {
	// 		for (i = 0; i < list.length; i++) {
	// 			show_kml (route, list[i]);
	// 		}
	// 	} else {
	// 		for (i = 0; i < list.length; i++) {
	// 			hide_kml (route, list[i]);
	// 		}
	// 	}
	// }

	// if ((kml.camp === true) && attr.contains ("c") && extra) {
	// 	show_kml (route, "camp");
	// } else {
	// 	hide_kml (route, "camp");
	// }

	// if ((kml.hike === true) && attr.contains ("h") && extra) {
	// 	show_kml (route, "hike");
	// 	hike = true;
	// } else {
	// 	hide_kml (route, "hike");
	// }

	// if ((kml.todo === true) && attr.contains ("t") && extra) {
	// 	show_kml (route, "todo");
	// 	todo = true;
	// } else {
	// 	hide_kml (route, "todo");
	// }

	// if ((kml.ferry === true) && attr.contains ("f") && extra) {
	// 	show_kml (route, "ferry");
	// 	ferry = true;
	// } else {
	// 	hide_kml (route, "ferry");
	// }

	// walked = hike || todo || ferry;

	// if ((kml.route === true) && attr.contains ("r") && (!walked)) {
	// 	show_kml (route, "route");
	// } else {
	// 	hide_kml (route, "route");
	// }

	// if (opt_zoom) {
	// 	map_zoom_route (route);
	// }
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

	map_zoom_route(option);

	show_route (option);
}


$.getJSON("rich.json", function(data) {
	route_list = data;
	dd_init();
})
.fail(function() {
	alert("Couldn't load route data");
});

map_init();
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
	return;

	for (var r in route_list) {
		var complete = 0;
		var dist_route = 0;
		var route = false;
		// var attr = route_list[r].attr;

		if ("complete" in route_list[r]) {
			complete = route_list[r].complete;
		}
		if ("dist_route" in route_list[r]) {
			dist_route = route_list[r].dist_route;
		}
		// if (attr.contains ("r")) {
		// 	route = true;
		// }

		// if (!show_comp && route && (complete == 100)) {
		// 	hide_route (r);
		// }
		// if (!show_inco && route && (complete < 100)) {
		// 	hide_route (r);
		// }
		// if (!show_unst && route && (complete === 0)) {
		// 	hide_route (r);
		// }
		// if (!show_join && !route && (complete == 100) && (dist_route > 0)) {
		// 	hide_route (r);
		// }
		// if (!show_hill && !route && (dist_route === 0)) {
		// 	hide_route (r);
		// }
	}

	// if (opt_one) {
	// 	hide_other_routes (dd.value);
	// }
}


function map_clear()
{
	$.each(layers, function(name, layer) {
		layer.setSource (new ol.source.Vector());
	});
}


var load;
var key;

$("#action").click(function() {
	// map.getView().setZoom (6);

	load = new ol.source.KML({
		projection: proj,
		url: "output/south.west.coast.kml",
		extractStyles: false,
	});

	key = load.on("change", function(e) {
		// alert(load.getState());
		// alert(load.getFeatures().length);
		if (load.getState() == "ready") {
			var features = [];
			var count = 0;
			load.forEachFeature(function(feature) {
				var type = feature.get("type");
				var tag  = feature.get("tag");
				if (!type || !tag) {
					return false;
				}
				var layer = layers[tag] || layers.extra;

				var src = layer.getSource();
				var clone = feature.clone();
				clone.setId(feature.getId());

				if (layer == layers.misc) {
					// var style = layer.getStyle();
					// clone.setStyle (style);
				}

				src.addFeature(clone);
				// alert(type); return true;
				// var id = feature.getId();
				// if (id) {
				// 	features.push(id);
				// }
				// var name = feature.get("length");
				// if (name) {
				// 	features.push(name);
				// }

				// alert (id + " " + name);
				// count++;
				// if (count > 3) {
				// 	return true;
				// }
			});

			load.unByKey(key);
			load = null;
		}
	});

	// layers.hike       = new ol.layer.Vector({
	// 	source: new ol.source.KML({
	// 		projection: proj,
	// 		url: "e2/hike.kml",
	// 		style: styles.hike,
	// 		extractStyles: false,
	// 	})
	// });

	// var src = layers.hike.getSource();
	// src.on("change", function(e) {
	// 	alert(src.getState());
	// });

});

// alert("done");
