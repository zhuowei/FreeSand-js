function trace(str){
	if(typeof(console)!="undefined"){
		console.log(str);
	}
	else{
		if(typeof(air)!="undefined"){
			air.trace(str);
		}
	}
}
function rand_nextInt(n){
	return parseInt(Math.random() * n);
}
function colorHexToRGB(c){
	var b=c%256;
	var g=(c%(256*256)-b)/256;
	var r=(c-(g*256)-b)/(256*256);
	return [r,g,b];
}
