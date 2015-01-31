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

function create_maps()
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

function create_styles()
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
	styles.ferry = new ol.style.Style({
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

function create_icons()
{
	var names = [
		"diamond_green", "map_ferry", "paddle_5",
		"diamond_red",   "map_hotel", "paddle_go",
		"r_green",       "map_hut",   "paddle_green",
		"r_red",         "map_tent",  "paddle_stop",
		"r_yellow",      "map_waves"
	];

	$.each(names, function(index, name) {
		var icon = new ol.style.Icon({
			anchor: [0.5, 1.0],
			anchorXUnits: "fraction",
			anchorYUnits: "fraction",
			src: "gfx/"+name+".png",
			scale: 0.5
		});

		icons[name] = new ol.style.Style({
			image: icon
		});
	});
}

function create_areas()
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
}

function map_debug()
{
	var l;
	var s;

	l = layers.route;
	s = l.getSource();
	s.addFeature(new ol.Feature({
		"geometry": new ol.geom.LineString([
			ol.proj.transform([0.469667 ,54.199919], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-2.408751,56.193443], "EPSG:4326", "EPSG:3857")
		])
	}));

	l = layers.variant;
	s = l.getSource();
	s.addFeature(new ol.Feature({
		"geometry": new ol.geom.LineString([
			ol.proj.transform([-2.584533,52.387873], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([0.513612 ,55.240489], "EPSG:4326", "EPSG:3857")
		])
	}));

	l = layers.ferry;
	s = l.getSource();
	s.addFeature(new ol.Feature({
		"geometry": new ol.geom.LineString([
			ol.proj.transform([-4.715880,53.708610], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-0.650939,52.508400], "EPSG:4326", "EPSG:3857")
		])
	}));

	l = layers.todo;
	s = l.getSource();
	s.addFeature(new ol.Feature({
		"geometry": new ol.geom.LineString([
			ol.proj.transform([-3.199767,55.812581], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-3.727111,52.535139], "EPSG:4326", "EPSG:3857")
		])
	}));

	l = layers.hike;
	s = l.getSource();
	s.addFeature(new ol.Feature({
		"geometry": new ol.geom.LineString([
			ol.proj.transform([-0.782775,56.058728], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-5.221251,54.251300], "EPSG:4326", "EPSG:3857")
		])
	}));
}

function icon_debug()
{
	var s;
	var f;

	s = layers.map_tent.getSource();
	f = new ol.Feature({
		"geometry": new ol.geom.MultiPoint([
			ol.proj.transform([1.315772, 51.125442], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([0.564278, 51.302789], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-0.101859,51.268486], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-0.487547,51.397620], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-1.747134,51.980209], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-1.793643,52.289314], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-1.783227,52.652994], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-1.867354,52.879218], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-2.103054,53.221056], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-1.972233,53.524503], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-2.061775,53.910507], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-2.293589,54.145201], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-2.475524,54.618098], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-2.547657,54.972432], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-2.290694,55.242017], "EPSG:4326", "EPSG:3857"),
		])
	});
	s.addFeature(f);

	s = layers.map_hut.getSource();
	f = new ol.Feature({
		"geometry": new ol.geom.MultiPoint([
			ol.proj.transform([-0.999423,51.469977], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-1.277531,51.778367], "EPSG:4326", "EPSG:3857"),
		])
	});
	s.addFeature(f);

	s = layers.map_hotel.getSource();
	f = new ol.Feature({
		"geometry": new ol.geom.MultiPoint([
			ol.proj.transform([-2.159982,54.455885], "EPSG:4326", "EPSG:3857"),
			ol.proj.transform([-2.274693,55.546693], "EPSG:4326", "EPSG:3857"),
		])
	});
	s.addFeature(f);

	s = layers.area_todo.getSource();
	f = new ol.Feature({
		"geometry": new ol.geom.Polygon([[
			ol.proj.transform([-3.199767,55.812581], "EPSG:4326", "EPSG:3857"),  // todo
			ol.proj.transform([-5.221251,54.251300], "EPSG:4326", "EPSG:3857"),  // hike
			ol.proj.transform([-4.715880,53.708610], "EPSG:4326", "EPSG:3857"),  // ferry
			ol.proj.transform([-3.727111,52.535139], "EPSG:4326", "EPSG:3857"),  // todo
			ol.proj.transform([-2.584533,52.387873], "EPSG:4326", "EPSG:3857"),  // variant
			ol.proj.transform([-0.650939,52.508400], "EPSG:4326", "EPSG:3857"),  // ferry
		]])
	});
	s.addFeature(f);

	s = layers.area_done.getSource();
	f = new ol.Feature({
		"geometry": new ol.geom.Polygon([[
			ol.proj.transform([-0.650939,52.508400], "EPSG:4326", "EPSG:3857"),  // ferry
			ol.proj.transform([0.469667 ,54.199919], "EPSG:4326", "EPSG:3857"),  // route
			ol.proj.transform([0.513612 ,55.240489], "EPSG:4326", "EPSG:3857"),  // variant
			ol.proj.transform([-0.782775,56.058728], "EPSG:4326", "EPSG:3857"),  // hike
			ol.proj.transform([-2.408751,56.193443], "EPSG:4326", "EPSG:3857"),  // route
			ol.proj.transform([-3.199767,55.812581], "EPSG:4326", "EPSG:3857"),  // todo
		]])
	});
	s.addFeature(f);
}

function init_map()
{
	create_styles();
	create_icons();
	create_areas();
	create_maps();

	// Route layers								  Default Line Style
	layers.route     = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.route      });
	layers.variant   = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.variant    });
	layers.ferry     = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.ferry      });
	layers.todo      = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.todo       });
	layers.hike      = new ol.layer.Vector({ source: new ol.source.Vector(), style: styles.hike       });

	// Icon layers	         						  Default Icon
	layers.map_hotel = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.map_hotel   });
	layers.map_hut   = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.map_hut     });
	layers.map_tent  = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.map_tent    });
	layers.end       = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.paddle_stop });
	layers.start     = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.paddle_go   });

	// Areas	         						  Default Area Styles
	layers.area_todo = new ol.layer.Vector({ source: new ol.source.Vector(), style: areas.todo        });
	layers.area_done = new ol.layer.Vector({ source: new ol.source.Vector(), style: areas.done        });

	// Misc		        						  Default Icon
	layers.extra     = new ol.layer.Vector({ source: new ol.source.Vector()                           });
	layers.rich      = new ol.layer.Vector({ source: new ol.source.Vector(), style: icons.r_green     });

	// Groups
	layers.group_area = new ol.layer.Group({
		layers: [ layers.area_todo, layers.area_done ]
	});
	layers.group_map = new ol.layer.Group({
		layers: [ maps.bing, maps.osm, maps.terrain, maps.stamen ]
	});
	layers.group_camp = new ol.layer.Group({
		layers: [ layers.map_hotel, layers.map_hut, layers.map_tent ]
	});

	map = new ol.Map({
		target: "map",
		layers: [
			// Layers grouped by depth
			layers.group_map, layers.group_area,
			layers.route, layers.variant,
			layers.todo, layers.ferry, layers.hike,
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


$("#show_comp").change(function() { show_comp = this.checked; on_show (this.id); });
$("#show_inco").change(function() { show_inco = this.checked; on_show (this.id); });
$("#show_unst").change(function() { show_unst = this.checked; on_show (this.id); });
$("#show_hill").change(function() { show_hill = this.checked; on_show (this.id); });
$("#show_join").change(function() { show_join = this.checked; on_show (this.id); });

$("#global_centre").click(function() { map_zoom_route(); });
$("#global_done")  .click(function() { alert("done");    });
$("#global_todo")  .click(function() { alert("todo");    });
$("#global_clear") .click(function() { map_clear();      });

var kml_hike    = new ol.dom.Input(document.getElementById("kml_hike"));    kml_hike.bindTo    ("checked", layers.hike,       "visible");
var kml_todo    = new ol.dom.Input(document.getElementById("kml_todo"));    kml_todo.bindTo    ("checked", layers.todo,       "visible");
var kml_ferry   = new ol.dom.Input(document.getElementById("kml_ferry"));   kml_ferry.bindTo   ("checked", layers.ferry,      "visible");
var kml_variant = new ol.dom.Input(document.getElementById("kml_variant")); kml_variant.bindTo ("checked", layers.variant,    "visible");
var kml_route   = new ol.dom.Input(document.getElementById("kml_route"));   kml_route.bindTo   ("checked", layers.route,      "visible");

var kml_camp    = new ol.dom.Input(document.getElementById("kml_camp"));    kml_camp.bindTo    ("checked", layers.group_camp, "visible");
var kml_area    = new ol.dom.Input(document.getElementById("kml_area"));    kml_area.bindTo    ("checked", layers.group_area, "visible");
var kml_start   = new ol.dom.Input(document.getElementById("kml_start"));   kml_start.bindTo   ("checked", layers.start,      "visible");
var kml_end     = new ol.dom.Input(document.getElementById("kml_end"));     kml_end.bindTo     ("checked", layers.end,        "visible");
var kml_extra   = new ol.dom.Input(document.getElementById("kml_extra"));   kml_extra.bindTo   ("checked", layers.extra,      "visible");

var resolution = new ol.dom.Input(document.getElementById("resolution"));
resolution.bindTo("value", map.getView(), "resolution").transform(parseFloat, String);

var load;
var key;

$("#action").click(function() {
	// map.getView().setZoom (6);

	load = new ol.source.KML({
		projection: proj,
		// url: "e2/camp.kml",
		url: "e2/all.kml",
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
				var layer = layers[type];
				var src = layer.getSource();
				// var style = layer.getStyle();
				var clone = feature.clone();
				clone.setId(feature.getId());
				// clone.setStyle (style);
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

// map_debug();
// icon_debug();

// alert("done");
