 //Convert (x,y,z) on unit sphere
 //back to (long, lat)
 //p is vector of three elements
function toEarth(p) {
	var longitude, latitude, DEG, colatitude;
	if (p.x === 0) {
		longitude = Math.PI / 2.0;
	} else {
		longitude = Math.atan(p.y / p.x);
	}
	colatitude = Math.acos(p.z);
	latitude = (Math.PI / 2.0 - colatitude);
	if (p.x < 0.0) {
		if (p.y <= 0.0) {
			longitude = -(Math.PI - longitude);
		} else {
			longitude = Math.PI + longitude;
		}
	}
	DEG = 180.0 / Math.PI;
	return {longitude: longitude * DEG, latitude: latitude * DEG};
}

function toCart(longitude, latitude){
	var theta = longitude;
	var phi = Math.PI/2.0 - latitude;
	// spherical coordinate use "co-latitude", not "latitude"
	// latitude = [-90, 90] with 0 at equator
	// co-latitude = [0, 180] with 0 at north pole
	return {x:Math.cos(theta)*Math.sin(phi),y:Math.sin(theta)*Math.sin(phi),z:Math.cos(phi)};
}


function spoints(longitude,latitude,meters,n){
	//constant to convert to radians
	var RAD = Math.PI/180.0;
	//mean radius of earth in meters
	var MR = 6378.1 * 1000.0;
	// compute long degrees in rad at a given lat
	var r = (meters/(MR * Math.cos(latitude * RAD)));
	var vec = toCart(longitude*RAD, latitude* RAD);
	var pt = toCart(longitude*RAD + r, latitude*RAD);
	var pts = [];
	var i;
	for(i=0;i<=n;i++){
		pts.push(toEarth(rotPoint(vec,pt,(2.0 * Math.PI/n)*i)));
	}
	//add another point to connect back to start
	pts.push(pts[0]);
	return pts;
}

function rotPoint(vec,pt,phi){
	//remap vector for clarity
	var u, v, w, x, y,z;
	u=vec.x;
	v=vec.y;
	w=vec.z;
	x=pt.x;
	y=pt.y;
	z=pt.z;
	var a, d,e;
	a=u*x + v*y + w*z;
	d = Math.cos(phi);
	e=Math.sin(phi);
	return {x:(a*u + (x-a*u)*d+ (v*z-w*y)*e),y:(a*v + (y - a*v)*d + (w*x - u*z) * e),z:(a*w + (z - a*w)*d + (u*y - v*x) * e)};
}

function kml_circle(longitude,latitude,meters,segments){
	var s = "";
	s += '<?xml version="1.0" encoding="utf-8"?>\n';
	s += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
	s += '\t<Document>\n';
	s += '\t\t<Placemark>\n';
	s += '\t\t\t<Polygon>\n';
	s += '\t\t\t\t<outerBoundaryIs>\n';
	s += '\t\t\t\t\t<LinearRing>\n';
	s += '\t\t\t\t\t\t<coordinates>\n';

	var pts = spoints(longitude,latitude,meters,segments);
	var len = pts.length;
	var i;
	for(i=0;i<len;i++){
		s += '\t\t\t\t\t\t\t' + pts[i].longitude.toFixed(6) + ',' + pts[i].latitude.toFixed(6) + '\n';
	}

	s += '\t\t\t\t\t\t</coordinates>\n';
	s += '\t\t\t\t\t</LinearRing>\n';
	s += '\t\t\t\t</outerBoundaryIs>\n';
	s += '\t\t\t</Polygon>\n';
	s += '\t\t</Placemark>\n';
	s += '\t</Document>\n';
	s += '</kml>\n';
	return s;
}

print (kml_circle (-3.183848, 54.699234, 1000, 20));

