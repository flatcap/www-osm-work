	var duration = 1000;
	var start = +new Date();

	var anim_bounce = ol.animation.bounce({
		duration: duration,
		// resolution: 4 * view.getResolution(),
		resolution: 1200,
		start: start
	});

	var anim_pan = ol.animation.pan({
		duration: duration,
		source: view.getCenter(),
		start: start+1
	});

	var anim_zoom = ol.animation.zoom({
		resolution: view.getResolution(),
		duration: 1000,
		start: start+2
	});

	map.beforeRender(anim_pan, anim_bounce, anim_zoom);

