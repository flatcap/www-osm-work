
function calc()
{
	var one = [ [
		{ X:-3.128303, Y:54.699234 },
		{ X:-3.129063, Y:54.702010 },
		{ X:-3.131271, Y:54.704514 },
		{ X:-3.134710, Y:54.706502 },
		{ X:-3.139045, Y:54.707778 },
		{ X:-3.143850, Y:54.708217 },
		{ X:-3.148654, Y:54.707777 },
		{ X:-3.152988, Y:54.706501 },
		{ X:-3.156427, Y:54.704513 },
		{ X:-3.158634, Y:54.702008 },
		{ X:-3.159393, Y:54.699232 },
		{ X:-3.158631, Y:54.696456 },
		{ X:-3.156422, Y:54.693952 },
		{ X:-3.152982, Y:54.691966 },
		{ X:-3.148649, Y:54.690690 },
		{ X:-3.143846, Y:54.690251 },
		{ X:-3.139044, Y:54.690691 },
		{ X:-3.134711, Y:54.691967 },
		{ X:-3.131272, Y:54.693954 },
		{ X:-3.129064, Y:54.696458 },
		{ X:-3.128303, Y:54.699234 },
		{ X:-3.128303, Y:54.699234 },
	] ];

	var two = [ [
		{ X:-3.148303, Y:54.699234 },
		{ X:-3.149063, Y:54.702010 },
		{ X:-3.151271, Y:54.704514 },
		{ X:-3.154710, Y:54.706502 },
		{ X:-3.159045, Y:54.707778 },
		{ X:-3.163850, Y:54.708217 },
		{ X:-3.168654, Y:54.707777 },
		{ X:-3.172988, Y:54.706501 },
		{ X:-3.176427, Y:54.704513 },
		{ X:-3.178634, Y:54.702008 },
		{ X:-3.179393, Y:54.699232 },
		{ X:-3.178631, Y:54.696456 },
		{ X:-3.176422, Y:54.693952 },
		{ X:-3.172982, Y:54.691966 },
		{ X:-3.168649, Y:54.690690 },
		{ X:-3.163846, Y:54.690251 },
		{ X:-3.159044, Y:54.690691 },
		{ X:-3.154711, Y:54.691967 },
		{ X:-3.151272, Y:54.693954 },
		{ X:-3.149064, Y:54.696458 },
		{ X:-3.148303, Y:54.699234 },
		{ X:-3.148303, Y:54.699234 },
	] ];

	var three = [ [
		{ X:-3.168303, Y:54.699234 },
		{ X:-3.169063, Y:54.702010 },
		{ X:-3.171271, Y:54.704514 },
		{ X:-3.174710, Y:54.706502 },
		{ X:-3.179045, Y:54.707778 },
		{ X:-3.183850, Y:54.708217 },
		{ X:-3.188654, Y:54.707777 },
		{ X:-3.192988, Y:54.706501 },
		{ X:-3.196427, Y:54.704513 },
		{ X:-3.198634, Y:54.702008 },
		{ X:-3.199393, Y:54.699232 },
		{ X:-3.198631, Y:54.696456 },
		{ X:-3.196422, Y:54.693952 },
		{ X:-3.192982, Y:54.691966 },
		{ X:-3.188649, Y:54.690690 },
		{ X:-3.183846, Y:54.690251 },
		{ X:-3.179044, Y:54.690691 },
		{ X:-3.174711, Y:54.691967 },
		{ X:-3.171272, Y:54.693954 },
		{ X:-3.169064, Y:54.696458 },
		{ X:-3.168303, Y:54.699234 },
		{ X:-3.168303, Y:54.699234 },
	] ];

	var scale = 1000000;
	ClipperLib.JS.ScaleUpPaths (one,   scale);
	ClipperLib.JS.ScaleUpPaths (two,   scale);
	ClipperLib.JS.ScaleUpPaths (three, scale);

	var cpr = new ClipperLib.Clipper();
	cpr.AddPaths (one,   ClipperLib.PolyType.ptSubject, true);
	cpr.AddPaths (two,   ClipperLib.PolyType.ptClip,    true);
	cpr.AddPaths (three, ClipperLib.PolyType.ptClip,    true);

	var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
	var clip_fillType    = ClipperLib.PolyFillType.pftNonZero;

	var result = new ClipperLib.Paths();
	cpr.Execute (ClipperLib.ClipType.ctUnion, result, subject_fillType, clip_fillType);

	var coords = "";
	var first;
	var i;
	for (i = 0; i < result[0].length; i++){
		var x = (result[0][i].X / scale).toFixed(6);
		var y = (result[0][i].Y / scale).toFixed(6);
		coords += x + ", " + y + "<br>\n";
		if (i == 0) {
			first = coords;
		}
	}
	coords += first;
	
	var cont = document.getElementById ('output')
	cont.innerHTML += coords;
}

