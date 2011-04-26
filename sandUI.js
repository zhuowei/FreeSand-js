var world;
var canvas;
var cxt;
var imgData;
var isRunning=true;
var prevBuffer;
var timer;
var timer_time=10;
var paused=false;
var curElement=elements.sand;
var pensize=15;
var canvasIsDown=false;
var pensizepicker;
var scaleFactor=2;

function pause(){
	isRunning=false;
	paused=true;
}
function unpause(){
	isRunning=true;
	paused=false;
	run();
}
function run(){
	if(isRunning){
		world.update();
		paintCanvas();
		window.setTimeout(run,timer_time);
	}
}
function pauseButtonClicked(){
	if(paused){
		unpause();
		document.getElementById("pause").innerHTML="Pause";
	}
	else{
		pause();
		document.getElementById("pause").innerHTML="Resume";
	}
}
function paintCanvas(){
	    //ripped off from https://github.com/bfirsh/jsnes/blob/master/source/ui.js.
            //var imageData = imgData.data;
            var c, i, j;

            for (i=0; i<world.pixels.length; i++) {
		if(prevBuffer[i]!=world.pixels[i]){
                    j = i*4;
		    c=world.pixels[i];
/*
		    var color=colorHexToRGB(world.pixels[i]);
function colorHexToRGB(c){
	var b=c%256;
	var g=(c%(256*256)-b)/256;
	var r=(c-(g*256)-b)/(256*256);
	return [r,g,b];
}*/
                    imgData.data[j+2] = c%256;
                    imgData.data[j+1] = (c%(256*256)-c%256)/256;
                    imgData.data[j] = (c-c%(256*256))/(256*256);
/*
                    imgData.data[j] = color[0];
                    imgData.data[j+1] = color[1];
                    imgData.data[j+2] = color[2];
*/
		//if(pixel==SAND_SOURCE){
		//	trace(world.pixels[i-1]);
		//}

                    prevBuffer[i] = world.pixels[i];
                }

            }
	    //imgData.data=imageData;
            cxt.putImageData(imgData, 0, 0);
                
}
function canvasMouseDown(e){
	//trace("down");
	canvasIsDown=true;
	canvasMouseMove(e);
}
function canvasMouseUp(e){
	canvasIsDown=false;
}
function canvasMouseMove(e){
	if(canvasIsDown){
		var x; //code from http://diveintohtml5.org/canvas.html. I think it's fair use.
		var y;
		if (e.pageX != undefined && e.pageY != undefined) {
			x = e.pageX;
			y = e.pageY;
		}
		else {
			x = e.clientX + document.body.scrollLeft +
			    document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop +
			    document.documentElement.scrollTop;
		}
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		world.draw(parseInt(x/scaleFactor), parseInt(y/scaleFactor), pensize, curElement);
		if(paused){
			paintCanvas();
		}
	}
}

function init(){
canvas=document.getElementById("maincanvas");
cxt=canvas.getContext("2d");
canvas.style.width=canvas.width*scaleFactor + "px";
canvas.style.height=canvas.height*scaleFactor + "px";
//canvas.style.imageRendering="optimizeSpeed";
imgData=cxt.getImageData(0,0,canvas.width,canvas.height);
world=new World(canvas.width, canvas.height, AIR);
//world.pixels[world.width*30 + 50]=OIL_SOURCE;
document.getElementById("pause").onclick=pauseButtonClicked;
document.getElementById("loadbutton").onclick=loadButtonClicked;
document.getElementById("savebutton").onclick=saveButtonClicked;
pensizepicker=document.getElementById("pensizepicker")
pensizepicker.onchange=pensizeChange;
prevBuffer=new Array(world.pixels.length); 
resetCanvas();
canvas.onmousedown=canvasMouseDown;
canvas.onmouseup=canvasMouseUp;
canvas.onmousemove=canvasMouseMove;
elementSelInit();
//elementSelChange(defaultElement);
document.getElementById("intervalboxsubmit").onclick=intervalBoxChange;
//loadWorld(11);
run();
}
function resetCanvas(){
                    cxt.fillStyle = 'black';
                    // set alpha to opaque
                    cxt.fillRect(0, 0, canvas.width, canvas.height);

                    // Set alpha
                    for (var i = 3; i < imgData.data.length-3; i += 4) {
                        imgData.data[i] = 0xFF;
                    }

}	
function elementSelChange(el){
	trace(el);
	curElement=elements[el];
}

function elementSelInit(){
	elementSel=document.getElementById("elementsel");
	var value="";
	for(var i in elements){
		if(elements[i].elementName!="Fire1"&&elements[i].elementName!="Fire2"&&elements[i].elementName!="Fire3"&&elements[i].elementName!="Fire4"
		 && elements[i].elementName!="Fire5" && elements[i].elementName!="Fire6"){
			value=value+"<button style=\"background-color: " + elements[i].color.toString() +
				"\" onclick=\"elementSelChange(\'" + i + "\')\">" + elements[i].elementName + "</button>" ;
		//elementSel.children.add(new Option(element[i].elementName, i));
		}

	}
	elementSel.innerHTML=value;
}
function intervalBoxChange(){
	var nuTime=parseInt(document.getElementById("timeinterval").value);
	if(nuTime>10){
		timer_time=nuTime;
		pause();
		unpause();
	}
}
function pensizeInc(){
	if(pensize<canvas.width){
		pensize++;
	}
}
function pensizeDec(){
	if(pensize>1){
		pensize--;
	}
}
function pensizeChange(){
	pensize=parseInt(pensizepicker.value);
	trace(pensize);
}
window.onload=init;
window["elementSelChange"]=elementSelChange;
function saveWorld(slot){
	trace("saving to slot" + slot);
	localStorage["freesand_save"+slot]=world.pixels.join();
}
function loadWorld(slot){
	if(localStorage&&localStorage["freesand_save"+slot]){
		world.pixels=localStorage["freesand_save"+slot].split(",");
		return true;
	}
	return false;
}
function loadButtonClicked(){
	if(!loadWorld(1)){
		alert("There is no saved world. Click on the Save button to save the current world.");
	}
}
function saveButtonClicked(){
	saveWorld(1);
}
