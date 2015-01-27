
window.cb = function cb(json) {
	// var str = JSON.stringify(json);
	var lat = json[0].lat;
	var lon = json[0].lon;
	document.getElementById('output').innerHTML = lat + ',' + lon;
};

window.search = function search() {
	var s = document.createElement('script');

	// s.src = 'http://nominatim.openstreetmap.org/reverse' +
	// 	'?json_callback=cb' +
	// 	'&format=json' +
	// 	'&lat=-23.56320001' +
	// 	'&lon=-46.66140002' +
	// 	'&zoom=27' +
	// 	'&addressdetails=1';

	s.src = 'http://nominatim.openstreetmap.org/' +
		'?json_callback=cb' +
		'&format=json' +
		'&viewbox=-5.5,59,1.5,50' +	// Hint: UK first
		'&q=oxford';

	document.getElementsByTagName('head')[0].appendChild(s);
};

