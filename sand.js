/**
 * @license
 *
 * FreeSand is a pure java implementation of a cellular automata
 * simulation inspired by falling sand like games.
 *
 * Copyright (C) 2007 Robert B. Harris (freesand@trebor.org)
 * Ported to JavaScript by Zhuowei
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301, USA.
 *
 **/

/* Random obj constructor
 * @constructor
 */

function Random(){
	this.nextInt=function(x){
		return parseInt(Math.random() * x);
	}
	this.nextBoolean=function(){
		return (Math.random()>=0.5);

	}
}
         /** a handy dandy random number generater */

var rnd=new Random();

         /** @const indicates that a given pixel is not going to change this
          * update cycle */

var   NO_CHANGE      = -1;

         /** @const number of randomized row indices we have to choose from */

var   RND_INDEX_CNT  = 200;

         // chance in X of something happening


         /** @const chance in X that fire will break out */

var FIRE_CHANCE_IN  = 3;

         /** @const chance in X that water will spout out of a water source */

var WATER_CHANCE_IN = 10;

         /** @const chance in X that plant will grow */

var PLANT_CHANCE_IN = 23;

         /** @const chance sand will spout out of a sand source */

var SAND_CHANCE_IN  = 10;
/* salt dissolve @const */
var SALT_CHANCE_DISSOLVE=5;
/* concrete to rock @const */
var CONCRETE_CHANCE_SOLID=42;

/* Color constructor.
 * @constructor
 */
function Color(r,g,b){
	this.r=r;
	this.g=g;
	this.b=b;
	this.value=(r*(256*256) + g*256 +b);
	this.toString=function(){
		return "rgb(" + r + "," + g + "," + b + ")";
	}
}

/* element constructor.
 * @constructor
 */
function Element(myName, myColor){
	this.elementName=myName;
	this.color=myColor;
	this.value=this.color.value;
}

var elements={
	air:new Element("Air", new Color(0,0,0)),
        water:new Element("Water", new Color(0,0,255)),
        sand:new Element("Sand", new Color(255,225,0)),
        earth:new Element("Earth", new Color(200,40,37)),
	oil:new Element("Oil",new Color(200,100,0)),
        plant:new Element("Plant",new Color(0,255,0)),
        rock:new Element("Rock", new Color(100,100,100)),

	concrete:new Element("Concrete",new Color(150,150,150)),
	salt:new Element("Salt", new Color(200,200,200)),
	saltwater:new Element("Saltwater", new Color(50,150,200)), 

               // valuebles
/*
            GOLD_EL   ("Gold",   ORANGEISH_HUE, SAT1,  BRIGHT1, null),
            SILVER_EL ("Silver", RED_HUE,       SAT5,  BRIGHT2, null),
            COPPER_EL ("Copper", RED_HUE,       SAT1,  BRIGHT2, null),
*/
               // fire!

         fire1:new Element("Fire",  new Color(204,   0,   0)),
         fire2:new Element("Fire2", new Color(255, 204,  51)),
         fire3:new Element("Fire3", new Color(255, 204,   0)),
         fire4:new Element("Fire4", new Color(255, 153,   0)),
         fire5:new Element("Fire5", new Color(255, 102,   0)),
         fire6:new Element("Fire6", new Color(255,  51,   0)),

               // sources
            
         airSource:new Element("Black Hole",   new Color(128,   0,  64)),
         waterSource:new Element("Water Source", new Color(0,0,150)),
         sandSource:new Element("Sand Source", new Color(200,150,0)),
         fireSource:new Element("Fire Source", new Color(150,0,0)),
         oilSource:new Element("Oil Source",  new Color(150,50,0))
}; 
            // fields
/*         
         final String  elementName;
         final Color   color;
         final int     value;
         final Element sourceOf;
*/
         /** @const air element integer value */

var AIR    = elements.air.value;
         /** @const water element integer value */
var WATER  = elements.water.value;
         /** @const sand element integer value */
var SAND   = elements.sand.value;
         /** @const earth element integer value */
var EARTH  = elements.earth.value;
         /** @const oil element integer value */
var OIL    = elements.oil.value;
var PLANT  = elements.plant.value;
         /** @const rock element integer value */
var ROCK   = elements.rock.value;
         /** fire1 element integer value */
var FIRE1  = elements.fire1.value;
         /** fire2 element integer value */
var FIRE2  = elements.fire2.value;
         /** fire3 element integer value */
var FIRE3  = elements.fire3.value;
         /** fire4 element integer value */
var FIRE4  = elements.fire4.value;
         /** fire5 element integer value */
var FIRE5  = elements.fire5.value;
         /** fire6 element integer value */
var FIRE6  = elements.fire6.value;
         /** air source element integer value */
var AIR_SOURCE   = elements.airSource.value;
         /** water source element integer value */
var WATER_SOURCE = elements.waterSource.value;
         /** sand source element integer value */
var SAND_SOURCE  = elements.sandSource.value;
         /** fire source element integer value */
var FIRE_SOURCE  = elements.fireSource.value;
         /** oil source element integer value */
var OIL_SOURCE   = elements.oilSource.value;
var CONCRETE = elements.concrete.value;
var SALT=elements.salt.value;
var SALTWATER=elements.saltwater.value;
   /**
    * World provides the freesand simulation functionality and element
    * behavior.  User interface functionality occurs in {@link
    * Game}. 
    * @constructor
    */
function World(width,height,bgElement){
	this.width=width;
	this.height=height;
	this.pixels=new Array(width*height);
	for(var i=0;i<this.pixels.length;i++){
		this.pixels[i]=bgElement;
	}
	this.background=elements.air;
         /** arrays of random numbers used to visit pixles in a given
          * row in a random order, pixels may be visited 0 or more times
          * on each update cycle */
        this.xRndIndex = new Array(RND_INDEX_CNT);
	for(var i=0;i<this.xRndIndex.length;i++){
		this.xRndIndex[i]=new Array(this.width);
		for(var c=0;c<this.xRndIndex[i].length;c++){
			this.xRndIndex[i][c] = parseInt(Math.random() * this.xRndIndex[i].length);
		}
	}
	this.draw=function(xcentre, ycentre, size, element){

		var xleft=parseInt(xcentre-(size/2));
		var ytop=parseInt(ycentre-(size/2));
		//trace("draw" + xleft + "," + ytop);
		var elval=element.value;
		for(var y=ytop;y<=ytop+size;y++){
			//trace(y);
			for(var x=xleft;x<=xleft+size;x++){
				//trace(x);
				this.pixels[(y*this.width)+x]=elval;
				//trace(x + " " + y + " = " + (y*this.width)+x);
			}
		}
	}

         /** 
          * Update the world state.  Note that the follow code is a
          * morass of if conditionals.  This is done so that the code
          * runs fast.  It would be easy to come up with an abstraction
          * layer which would make this code more general and robust,
          * but at the cost of performance.  I look forward to seeing a
          * clever, low cost, abstraction, if someone can figure one
          * out.
          */
      
      this.update=function(){
            // start from the bottome of the world

         for (var y = this.height - 1; y >= 0; --y){
               // compute offset to this and next line

            var thisOffset = y * this.width;
            var nextOffset = thisOffset + this.width;
            
               // are we at top or bottom

            var atTop = y == 0;
            var atBot = y == height - 1;

               // process line in random order
		var rndIndex=parseInt(Math.random() * RND_INDEX_CNT)
            for (var x_x in this.xRndIndex[rndIndex]){
		var x=this.xRndIndex[rndIndex][x_x];
                  // index of this pixel

               var ip = parseInt(thisOffset) + parseInt(x);
               //trace(thisOffset + " x: " + x + " ip: " + ip);               
                  // value this pixel
	       
               var p = this.pixels[ip];
	       

                  // don't do process certain things

               if (p == AIR || p == ROCK || p == EARTH)
                  continue;

                  // are we on a left or right edge?

               var atLeft = x == 0;
               var atRight = x == this.width - 1;

                  // indices of pixels around this particle

               var iuc = ip - this.width;
               var idc = ip + this.width;
               var idl = idc - 1;
               var idr = idc + 1;
               var il = ip - 1;
               var ir = ip + 1;

                  // get pixels for each index

               var uc = atTop            ? ROCK : this.pixels[iuc];
               var dc = atBot            ? ROCK : this.pixels[idc];
               var dl = atBot || atLeft  ? ROCK : this.pixels[idl];
               var dr = atBot || atRight ? ROCK : this.pixels[idr];
               var l =  atLeft           ? ROCK : this.pixels[il];
               var r =  atRight          ? ROCK : this.pixels[ir];
               
                  // the follwing actions propogate elements around the
                  // world, they do not conserve matter

                  // if fire, propogate fire

               if (p == FIRE1 || p == FIRE2 || p == FIRE3 || 
                   p == FIRE4 || p == FIRE5 || p == FIRE6)
               {
                  var burn = [atLeft  ? ip : il,
                                atRight ? ip : ir,
                                atTop   ? ip : iuc,
                                atBot   ? ip : idc];


                  for (var ib in burn)
                  {
                     var b = this.pixels[burn[ib]];

                     if ((b == PLANT || b == OIL) &&
                         parseInt(Math.random() * FIRE_CHANCE_IN) == 0)
                        this.pixels[burn[ib]] = FIRE1;
                     else
                        if (b == WATER)
                        {
                           this.pixels[burn[ib]] = AIR;
                           this.pixels[ip] = AIR;
                           p = AIR;
                           break;
                        }
                  }
                     // move fire along

                  if (p == FIRE1)
                  {
                     this.pixels[ip] = FIRE3;
                     continue;
                  }
                  if (p == FIRE2)
                  {
                     this.pixels[ip] = FIRE3;
                     continue;
                  }
                  if (p == FIRE3)
                  {
                     this.pixels[ip] = FIRE4;
                     continue;
                  }
                  if (p == FIRE4)
                  {
                     this.pixels[ip] = FIRE5;
                     continue;
                  }
                  if (p == FIRE5)
                  {
                     this.pixels[ip] = FIRE6;
                     continue;
                  }
                  if (p == FIRE6)
                  {
                     this.pixels[ip] = AIR;
                     continue;
                  }
               }
		//concrete
               if (p == CONCRETE){
                  var targets = [atLeft  ? ip : il,
                                   atRight ? ip : ir,
                                   //atTop   ? ip : iuc,
                                   atBot   ? ip : idc];
                  for (var it in targets){
                        
			//int target=atBot? ip : idc;
			if(this.pixels[targets[it]]==ROCK && parseInt(Math.random() * CONCRETE_CHANCE_SOLID)==0){
				this.pixels[ip] = ROCK;
				continue;
				//System.out.println("now rock");
			}

	          }
		}
                  // if this is an everything sucker

               if (p == AIR_SOURCE)
               {
                  var targets = [atLeft  ? ip : il,
                                   atRight ? ip : ir,
                                   atTop   ? ip : iuc,
                                   atBot   ? ip : idc];
                  for (var it in targets)
                        this.pixels[targets[it]] = AIR;
                  continue;
               }
                  // if this is a water source

               if (p == WATER_SOURCE)
               {
                  var targets = [atLeft  ? ip : il,
                                   atRight ? ip : ir,
                                   atTop   ? ip : iuc,
                                   atBot   ? ip : idc];
                  for (var it in targets)
                     if (this.pixels[targets[it]] == AIR &&
                         rnd.nextInt(WATER_CHANCE_IN) == 0)
                        this.pixels[targets[it]] = WATER;
                  continue;
               }
                  // if this is a fire source

               if (p == OIL_SOURCE)
               {
                  var targets = [atRight ? ip : ir,
                                   atLeft  ? ip : il,
                                   atTop   ? ip : iuc,
                                   atBot   ? ip : idc];
                  for (var it in targets)
                     if (this.pixels[targets[it]] == AIR)
                        this.pixels[targets[it]] = OIL;
                  continue;
               }
                  // if this is a sand source

               if (p == SAND_SOURCE)
               {
                  var targets = [atLeft  ? ip : il,
                                   atRight ? ip : ir,
                                   atTop   ? ip : iuc,
                                   atBot   ? ip : idc];
                  for (var it in targets)
                     if (this.pixels[targets[it]] == AIR &&
                         rnd.nextInt(SAND_CHANCE_IN) == 0){
				//trace(it);
                        	this.pixels[targets[it]] = SAND;
	             }
                  continue;
               }
                  // if this is a plant, propogate growth

               if (p == PLANT)
               {

                  var iul = iuc - 1;
                  var iur = iuc + 1;

                  var targets = [atLeft             ? ip : il,
                                   atLeft  || atTop   ? ip : iul,
                                   atRight            ? ip : ir,
                                   atRight || atTop   ? ip : iur,
                                   atTop              ? ip : iuc,
                                   atBot              ? ip : idc,
                                   atBot   || atLeft  ? ip : idl,
                                   atBot   || atRight ? ip : idr
                  ];
                  for (var ix in targets)
                     if (this.pixels[targets[ix]] == AIR)
                        for (var it in targets)
                           if (this.pixels[targets[it]] == WATER && rnd.nextInt(PLANT_CHANCE_IN) == 0)
                              this.pixels[targets[it]] = PLANT;
                  continue;
               }
                  // if this is a fire source

               if (p == FIRE_SOURCE)
               {
                  var targets = [atLeft  ? ip : il,
                                   atRight ? ip : ir,
                                   atTop   ? ip : iuc,
                                   atBot   ? ip : idc];
                  for (var it in targets)
                     if (this.pixels[targets[it]] == PLANT || this.pixels[targets[it]] == OIL)
                        this.pixels[targets[it]] = FIRE1;
                  continue;
               }
                  //dissolve salt
	       if(p == SALT){
		  var targets = [atLeft  ? ip : il,
                                   atRight ? ip : ir,
                                   atTop   ? ip : iuc,
                                   atBot   ? ip : idc];
                  for (var it in targets){
                     if (this.pixels[targets[it]] == WATER &&
                         rnd.nextInt(SALT_CHANCE_DISSOLVE) == 0){
                        this.pixels[ip] = SALTWATER;
		     }
		  }
                  
	       }
		
                  // all actions from this point on conserve matter
                  // we only calculate the place to which this particle
                  // will move, the the default is to do nothing

               var dest = NO_CHANGE;
                           
                  // if it's a oil

               if (p == OIL)
               {
                     // comput indices for up left and up right

                  var iul = iuc - 1;
                  var iur = iuc + 1;

                     // get pixels for each index

                  var ul = atTop || atLeft  ? ROCK : this.pixels[iul];
                  var ur = atTop || atRight ? ROCK : this.pixels[iur];

                     // if there is sand/earth above, erode that

                  if (uc == EARTH || uc == SAND)
                     dest = iuc;                     

                     // if pixles up left and up right sand/water

                  else if ((ul == EARTH || ul == SAND) && 
                           (ur == EARTH || ur == SAND))
                     dest = Math.random()>=0.5 ? iul : iur;

                     // if air underneath, go down
                  
                  else if (dc == AIR)
                     dest = idc;
                  
                     // if air on both sides below, pick one

                  else if (dl == AIR && dr == AIR)
                     dest = Math.random()>=0.5 ? idl : idr;

                     // if air only down left, go left

                  else if (dl == AIR)
                     dest = idl;

                     // if air only down right, go right

                  else if (dr == AIR)
                     dest = idr;

                     // if air on both sides below, pick one

                  else if ((l == AIR || l == EARTH || l == SAND) &&
                           (r == AIR || r == EARTH || r == SAND))
                     dest = Math.random()>=0.5 ? il : ir;

                     // if air only down left, go left

                  else if (l == AIR || l == EARTH || l == SAND)
                     dest = il;

                     // if air only down right, go right

                  else if (r == AIR || r == EARTH || r == SAND)
                     dest = ir;

                     // the case where water flows out two pixels
                  
                  else
                  {
                        // get items 2 pixels on either side of this one

                     var ill = ip - 2;
                     var irr = ip + 2;
                     var ll = x < 2         ? ROCK : this.pixels[ill];
                     var rr = x > width - 3 ? ROCK : this.pixels[irr];

                        // if air on both sides, pick one

                     if (ll == AIR && rr == AIR)
                        dest = Math.random()>=0.5 ? irr : ill;
                     
                        // if air only right right, go right right
                     
                     else if (rr == AIR)
                        dest = irr;
                     
                        // if air only left left, go left left

                     else if (ll == AIR)
                        dest = ill;
                  }
               }
                  // if it's water

               else if (p == WATER||p==SALTWATER)
               {
                     // comput indices for up left and up right

                  var iul = iuc - 1;
                  var iur = iuc + 1;

                     // get pixels for each index

                  var ul = atTop || atLeft  ? ROCK : this.pixels[iul];
                  var ur = atTop || atRight ? ROCK : this.pixels[iur];

                     // if there is sand/earth above, erode that

                  if (uc == EARTH || uc == SAND||uc==SALT)
                     dest = iuc;                     

                     // if pixles up left and up right sand/water

                  else if ((ul == EARTH || ul == SAND||ul==SALT) && 
                           (ur == EARTH || ur == SAND||ur==SALT))
                     dest = Math.random()>=0.5 ? iul : iur;

                     // if air underneath, go down
                  
                  else if (dc == AIR || dc == OIL)
                     dest = idc;

                     // if air on both sides below, pick one

                  else if ((dl == AIR || dl == OIL) && (dr == AIR || dr == OIL))
                     dest = Math.random()>=0.5 ? idl : idr;

                     // if air only down left, go left

                  else if (dl == AIR || dl == OIL)
                     dest = idl;

                     // if air only down right, go right

                  else if (dr == AIR || dr == OIL)
                     dest = idr;

                     // if air on both sides below, pick one

                  else if ((l == AIR || l == EARTH || l == SAND||l==SALT) &&
                           (r == AIR || r == EARTH || r == SAND||r==SALT))
                     dest = Math.random()>=0.5 ? il : ir;

                     // if air only down left, go left

                  else if (l == AIR || l == EARTH || l == SAND||l==SALT)
                     dest = il;

                     // if air only down right, go right

                  else if (r == AIR || r == EARTH || r == SAND||r==SALT)
                     dest = ir;

                     // the case where water flows out two pixels
                  
                  else
                  {
                        // get items 2 pixels on either side of this one

                     var ill = ip - 2;
                     var irr = ip + 2;
                     var ll = x < 2         ? ROCK : this.pixels[ill];
                     var rr = x > width - 3 ? ROCK : this.pixels[irr];

                        // if air on both sides, pick one

                     if (ll == AIR && rr == AIR)
                        dest = Math.random()>=0.5 ? irr : ill;
                     
                        // if air only right right, go right right
                     
                     else if (rr == AIR)
                        dest = irr;
                     
                        // if air only left left, go left left

                     else if (ll == AIR)
                        dest = ill;
                  }
               }
                  // all other elements behave like sand

               else
               {
                     // if air underneath, go down
               
                  if (dc == AIR || dc == WATER)
                     dest = idc;

                     // if air on both sides below, pick one

                  else if ((dl == AIR || dl == WATER) && 
                           (dr == AIR || dr == WATER))
                     dest = Math.random()>=0.5 ? idl : idr;

                     // if air only down left, go left

                  else if (dl == AIR || dl == WATER)
                     dest = idl;

                     // if air only down right, go right

                  else if (dr == AIR || dr == WATER)
                     dest = idr;
               }
                  // if a change is requried, swap pixles


                  if (dest != NO_CHANGE)
                  {
                     /*if (this.pixels[ip] == WATER_SOURCE)
                        trace("swap1 WS & " + Element.lookup(this.pixels[dest]));
                     if (this.pixels[dest] == WATER_SOURCE)
                        trace("swap2 WS & " + Element.lookup(this.pixels[ip]));*/

                     this.pixels[ip] = this.pixels[dest];
                     this.pixels[dest] = p;
                  }
               

	} //end if
    }//end for
  }//end function
}//end World()
//var testWorld=new World(500,500,FIRE1);
//testWorld.update();
