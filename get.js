
var requests = [ "get.json", "missing_file.json" ];

$.each(requests, function(index, value) {

	// Assign handlers immediately after making the request,
	// and remember the jqxhr object for this request
	var jqxhr = $.getJSON(value, function() {
		alert(value + " success");
	})
	.done(function() {
		alert(value + " second success");
	})
	.fail(function() {
		alert(value + " error");
	})
	.always(function() {
		alert(value + " complete");
	});

});

