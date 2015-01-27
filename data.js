
var m = document.getElementById('message');
m.innerHTML = "waiting...";

var info = "";
$.getJSON('data.json', function(data) {
	// info = JSON.stringify (data);
	// info = Object.keys(data);
	$.each(data.routes, function(index, value) {
		info += "<h1>" + data.routes[index].directory + "</h1>";
		info += "<ul>";
		$.each(data.routes[index], function(index, value) {
			if (value) {
				info += "<li>" + index + ": " + value + "</li>";
			}
		});
		info += "</ul>";
	});
	m.innerHTML = info;
});

