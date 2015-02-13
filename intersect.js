
function draw()
{
	var subj_paths = [[{X:10,Y:10},{X:110,Y:10},{X:110,Y:110},{X:10,Y:110}], [{X:20,Y:20},{X:20,Y:100},{X:100,Y:100},{X:100,Y:20}]];
	var clip_paths = [[{X:50,Y:50},{X:150,Y:50},{X:150,Y:150},{X:50,Y:150}], [{X:60,Y:60},{X:60,Y:140},{X:140,Y:140},{X:140,Y:60}]];
	var scale = 100;
	ClipperLib.JS.ScaleUpPaths(subj_paths, scale);
	ClipperLib.JS.ScaleUpPaths(clip_paths, scale);
	var cpr = new ClipperLib.Clipper();
	cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
	cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);
	var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
	var clip_fillType = ClipperLib.PolyFillType.pftNonZero;
	var clipTypes = [ClipperLib.ClipType.ctUnion, ClipperLib.ClipType.ctDifference, ClipperLib.ClipType.ctXor, ClipperLib.ClipType.ctIntersection];
	var clipTypesTexts = "Union, Difference, Xor, Intersection";
	var solution_paths, svg, cont = document.getElementById('svgcontainer');
	var i;
	for(i = 0; i < clipTypes.length; i++) {
		solution_paths = new ClipperLib.Paths();
		cpr.Execute(clipTypes[i], solution_paths, subject_fillType, clip_fillType);
		console.log(JSON.stringify(solution_paths));
		svg = '<svg style="margin-top:10px; margin-right:10px;margin-bottom:10px;background-color:#dddddd" width="160" height="160">';
		svg += '<path stroke="black" fill="yellow" stroke-width="2" d="' + paths2string(solution_paths, scale) + '"/>';
		svg += '</svg>';
		cont.innerHTML += svg;
	}
	cont.innerHTML += "<br>" + clipTypesTexts;
}

// Converts Paths to SVG path string
// and scales down the coordinates
function paths2string (paths, scale)
{
	var svgpath = "", i, j;
	if (!scale) scale = 1;
	for(i = 0; i < paths.length; i++) {
		for(j = 0; j < paths[i].length; j++){
			if (!j) svgpath += "M";
			else svgpath += "L";
			svgpath += (paths[i][j].X / scale) + ", " + (paths[i][j].Y / scale);
		}
		svgpath += "Z";
	}
	if (svgpath=="") svgpath = "M0,0";
	return svgpath;
}

