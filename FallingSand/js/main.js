// main.js
// Dependencies: 
// Description: singleton object
// This object handles all the main functionality of the scene

"use strict";

// app singleton
var app = app || {};


app.main = {
	// properties
	paused: false,
	animationID: 0,
	
    WIDTH : 0,
	HEIGHT: 400,
	MAXWIDTH : 600, // max possible width
	PREFEREDWIDTH : Math.floor(window.innerWidth) - getScrollBarWidth(),
	WIDTHPIX: undefined,
	HEIGHTPIX: undefined,
    canvas: undefined,
    ctx: undefined,
	dragging: undefined,
	penSize: undefined,
   	lastTime: 0, // used by calculateDeltaTime() 
	
	imageData: undefined,
	newFrameArray: undefined,
	oldFrameArray: undefined,
	sandColor: "#EBEFA0",


	
    // methods
	init : function() {
		// initialize properties
		this.canvas = document.querySelector('canvas');
		if (this.PREFEREDWIDTH > this.MAXWIDTH){
			this.WIDTH = this.MAXWIDTH; // limit size to maintain performance
		}
		else{
			this.WIDTH = this.PREFEREDWIDTH; // shrink to fit smaller pages
		}
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		this.dragging = false;
		this.penSize = 30;
		
		
		this.WIDTHPIX = this.WIDTH * 4,
		this.HEIGHTPIX = this.HEIGHT * 4,
		
		this.ctx.fillStyle = "black"; 
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
		
		this.canvas.onmousedown = this.doMousedown.bind(this);
		this.canvas.onmousemove = this.doMousemove.bind(this);
		this.canvas.onmouseup = this.doMouseup.bind(this);
		this.canvas.onmouseout = this.doMouseout.bind(this);
		
		this.canvas.touchstart = this.doTouchstart.bind(this);
		this.canvas.touchmove = this.doTouchmove.bind(this);
		
		this.sandColor= "#EBEFA0";
		
		this.setupUI();
		
		// this.addEventListener("touchstart", onmousedown, false)

		
		// start the scene loop
		this.update();
	},
	
	
	update: function(){

	 	this.animationID = requestAnimationFrame(this.update.bind(this));
	 	
		if(this.paused)
		{
			return;
		}
	 	
		
	 	// var dt = this.calculateDeltaTime();
	 	 

		
		this.imageData = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
		this.newFrameArray = this.imageData.data; //make a copy of the array that will store changes to the scene to push back to the canvas
		this.oldFrameArray = this.newFrameArray.slice(0); // make a copy of the unmodified array data to iterate through
		
		// iterate through every cell in the canvas
		for(var i = 0; i < this.newFrameArray.length; i += 4)
		{
			// if position has a color
			if(!this.isBlack(this.oldFrameArray, i))
			{
				// if the particle is the same in both arrays (aka: has not been modified)
				if(this.isSameMulti(this.oldFrameArray, this.newFrameArray, i, i))
				{
					// if the focused particle is fluid
					if(this.isFluid(i,this.oldFrameArray))
					{
						var positionBelow = this.below(i);
						// check if position below exists
						if(this.positionExists(positionBelow, this.oldFrameArray))
						{
							// check if space below is empty
							if(this.isBlack(this.oldFrameArray, positionBelow))
							{
								this.moveParticle(i, this.oldFrameArray, positionBelow, this.newFrameArray);
							}
							
							// attempt to merge
							else if(this.tryMerge(i,positionBelow))
							{
								//there was no reason not to put the merge code in the logic used to check if it was even possible
							}
							
							
							// attempt to sink
							else if(this.isFluid(positionBelow, this.oldFrameArray) && (this.isDenser(i, this.oldFrameArray, positionBelow)) && (Math.floor((Math.random() * 2)) == 1)) //if the particle below is fluid and less dense and a 50 percent dice role passed
							{
								this.switchCells(i, this.oldFrameArray, positionBelow, this.newFrameArray);
							}
						}
						
						// check sides to make sure they exist then try to move left or right randomly
						var dispersalDirection = Math.floor((Math.random() * 2))
						var rValue;
						var gValue;
						var bValue;
						var farRValue;
						
						// adjust values for left or right travel
						if(dispersalDirection == 0)
						{
							rValue = i-4;
							gValue = i-3;
							bValue = i-2;
							farRValue = i-8;
						}
						else
						{
							rValue = i+4;
							gValue = i+5;
							bValue = i+6;
							farRValue = i+8;
						}
						
						if(((dispersalDirection == 0 && (i>0)) || (dispersalDirection == 1 && i < this.newFrameArray.length-4)) && this.isFluidOrVoid(rValue, this.oldFrameArray))
						{
							// make sure the particle can be swapped
							if(!this.isSame(this.oldFrameArray, i, rValue) && this.isDenser(i,this.newFrameArray,rValue) && this.isDenser(i,this.oldFrameArray,rValue) && this.isSameMulti(this.newFrameArray, this.oldFrameArray, i, i) && this.isSameMulti(this.newFrameArray, this.oldFrameArray, rValue, rValue))
							{
								// if the particle is moving through fluid, make it do so slower
								if(!this.isBlack(this.newFrameArray, rValue))
								{
									// var densityValue = Math.ceil(this.getDensity(this.oldFrameArray[i-4], this.oldFrameArray[i-3], this.oldFrameArray[i-2]));
									// if(Math.floor((Math.random() * densityValue)) == 0)
									if(Math.floor((Math.random() * Math.ceil(this.getDensity(this.oldFrameArray[rValue], this.oldFrameArray[gValue], this.oldFrameArray[bValue])))) == 0)
									{
										this.switchCells(i, this.oldFrameArray, rValue, this.newFrameArray);
									}
								}
								// if the particle can spread twice as fast, do so
								else if((farRValue > 0) && (farRValue < this.newFrameArray.length-4) && this.isBlack(this.newFrameArray, farRValue) && this.isSameMulti(this.newFrameArray, this.oldFrameArray, farRValue, farRValue))
								{
									this.switchCells(i, this.oldFrameArray, farRValue, this.newFrameArray);
								}
								else
								{
									this.switchCells(i, this.oldFrameArray, rValue, this.newFrameArray);
								}
							}
						}
					}
				}
				this.plantGrow(this.oldFrameArray, this.newFrameArray, i);
				
			}
		}
		// apply the changes to the scene
		this.ctx.putImageData(this.imageData, 0, 0);
	},
	
	

	// calculate the delta time
	/*calculateDeltaTime: function(){
		// + calls Date.valueOf(), which converts it from an object to a 	
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},*/
	
	
	
	
	
	
	
	doTouchmove: function(e)
	{
		console.log("touchmove noticed");
		this.dragging = true;
		e.preventDefault();
	},

	
    doTouchstart: function(e)
	{
		console.log("touch noticed");
		doMousedown(e);
	},
	
	
	doMousedown: function(e)
	{
		this.dragging = true;
		
		var mouse = getMouse(e);
		
		this.ctx.fillStyle = this.sandColor;
	},
	
	
	doMousemove: function(e)
	{
		//bail out if the mouse button is not down
 		if(! this.dragging) return;
		
		//get location of mouse in canvas coordinates
		var mouse = getMouse(e);
		
		this.ctx.fillStyle = this.sandColor;
		this.ctx.fillRect(mouse.x - (this.penSize / 2), mouse.y - (this.penSize / 2), this.penSize, this.penSize);
		this.ctx.stroke();
	},
	
	
	doMouseup: function(e) 
	{
		this.dragging = false;
	},
	
	doMouseout: function(e) 
	{
		this.dragging = false;
	},
	
	
	// check if the position physically exists in the array
	positionExists: function(indexToCheck)
	{
		return(indexToCheck < this.oldFrameArray.length && indexToCheck);
	},
	
	// check if the cell is black
	isBlack: function(newFrameArray, indexLocation)
	{
		return(!newFrameArray[indexLocation] && !newFrameArray[indexLocation+1] && !newFrameArray[indexLocation+2]);
	},
	
	// check if the cell is water
	isWater: function(newFrameArray, indexLocation)
	{
		return((newFrameArray[indexLocation] == 0) && (newFrameArray[indexLocation+1] == 0) && (newFrameArray[indexLocation+2] == 255));
	},
	
	// check if the cell is plant
	isPlant: function(newFrameArray, indexLocation)
	{
		return(newFrameArray[indexLocation+1] == 248);
	},
	
	// check if the cell is sand
	isSand: function(newFrameArray, indexLocation)
	{
		return(newFrameArray[indexLocation] == 235);
	},
	
	isDeadPlant: function(newFrameArray, indexLocation)
	{
		return(newFrameArray[indexLocation] == 140);
	},
	
	isStone: function(newFrameArray, indexLocation)
	{
		return(newFrameArray[indexLocation] == 136);
	},
	
	//move the particle (this moves it then erases the old space (sets to void))
	moveParticle: function(startIndex, startarray, destinationIndex, destinationArray)
	{
		//the new array gets the move changes
		destinationArray[destinationIndex] = startarray[startIndex];
		destinationArray[destinationIndex+1] = startarray[startIndex+1];
		destinationArray[destinationIndex+2] = startarray[startIndex+2];
		
		//the old position is cleared in the new array
		destinationArray[startIndex] = 0;
		destinationArray[startIndex+1] = 0;
		destinationArray[startIndex+2] = 0;
	},
	
	setSandColor: function(color)
	{
		this.sandColor = color;
	},
	
	//setup Ui triggers
	setupUI: function()
	{
		document.querySelector("#sandType").onchange = function(e){

				this.sandColor = e.target.value;
			}.bind(this);
			
		document.querySelector("#PenSize").onchange = function(e){
				this.penSize = e.target.value;
			}.bind(this);
			
		document.querySelector("#clearButton").onclick = function(e){
			this.clearScene();
		}.bind(this);
		
		document.querySelector("#lakeButton").onclick = function(e){
			this.lakeScene();
		}.bind(this);
		
		document.querySelector("#lakeBedButton").onclick = function(e){
			this.lakeBedScene();
		}.bind(this);
		
		/*document.querySelector("#logButton").onclick = function(e){
			this.logScene();
		}.bind(this);*/
	},
	
	// swap two given cells positions in a new array (cell_1, oldFrameArray, cell_2, newFrameArray)
	switchCells: function(index1, array1, index2, array2)
	{
		array2[index1] = array1[index2];
		array2[index1+1] = array1[index2+1];
		array2[index1+2] = array1[index2+2];
		array2[index1+3] = array1[index2+3];
		
		array2[index2] = array1[index1];
		array2[index2+1] = array1[index1+1];
		array2[index2+2] = array1[index1+2];
		array2[index2+3] = array1[index1+3];
	},
	
	// returns true if this particle behaves like a fluid
	isFluid: function(index,array)
	{
		return (!(this.isStone(array, index) || this.isBlack(array, index) || this.isDeadPlant(array, index) || this.isPlant(array, index))); //hex 88 -> dec 136 stone, hex f8 -> dec 248 plant
	},
	
	// returns true if the particle is fluid or void
	isFluidOrVoid: function(index,array)
	{
		return (this.isFluid(index,array) || this.isBlack(array, index));
	},
	
	getDensity: function(rValue, gValue, bValue)
	{
		if((rValue > 0) && (rValue < 255))
		{
			if(rValue == 235)//sand //hex EB == dec 235
			{
				return 3;
			}
			else if(rValue == 35)
			{
				return 0.8;//oil
			}
			else //assume salt water
			{
				return 2
			}
		}
		else if (bValue > 0)
		{
			if(gValue > 0) //salt
			{
				return 3;
			}
			else//assume water
			{
				return 1;
			}
		}
		else if(gValue > 0)
		{
			return -1;//make void negative density to ensure it never impedes particle dispersal
		}
		else
		{
			return 0;// unknown but hey let it float
		}
	},
	
	// return true if objects are the same
	isSame: function(array, index1, index2)
	{
		return (array[index1] == array[index2] && array[index1+1] == array[index2+1] && array[index1+2] == array[index2+2]);
	},
	
	// return true if objects in different arrays are the same
	isSameMulti: function(array, array2, index1, index2)
	{
		return (array[index1] == array2[index2] && array[index1+1] == array2[index2+1] && array[index1+2] == array2[index2+2]);
	},
	
	// returns true if object one is denser then object two
	isDenser: function(index1, array, index2) // object1 array object2
	{
		return(this.getDensity(array[index1], array[index1+1], array[index1+2]) > this.getDensity(array[index2], array[index2+1], array[index2+2]));
	},
	
	// returns the index above focused cells
	above: function(index)
	{
		return (index - this.WIDTHPIX);
	},
	
	// returns the index below focused cells
	below: function(index)
	{
		return (index + this.WIDTHPIX);
	},
	
	// atempt to merge two material cells into a different material
	tryMerge: function(index,lowerIndex)
	{
		//determine the first object and compare the second to its list of reactants then reacts if able
		if((this.oldFrameArray[index] == 255) && (this.oldFrameArray[index+1] == 255) && (this.oldFrameArray[index + 2] == 255)) //is salt
		{
			
			if((this.oldFrameArray[lowerIndex] == 0) && (this.oldFrameArray[lowerIndex+1] == 0) && (this.oldFrameArray[lowerIndex + 2] == 255)) //is water
			{
				//set upper to black
				this.setBlack(index);
				
				//set lower to merge result (saltwater)
				this.newFrameArray[lowerIndex] = 170;
				this.newFrameArray[lowerIndex+1] = 204;
				this.newFrameArray[lowerIndex+2] = 255;
			}
			else
			{
				return false; //does not react with the first particle
			}
		}
		else if((this.oldFrameArray[index] == 0) && (this.oldFrameArray[index+1] == 0) && (this.oldFrameArray[index + 2] == 255)) //is water
		{
			if((this.oldFrameArray[lowerIndex] == 255) && (this.oldFrameArray[lowerIndex+1] == 255) && (this.oldFrameArray[lowerIndex + 2] == 255)) //is salt
			{
				//set upper to black
				this.setBlack(index);
				
				//set lower to merge result (saltwater)
				this.newFrameArray[lowerIndex] = 170;
				this.newFrameArray[lowerIndex+1] = 204;
				this.newFrameArray[lowerIndex+2] = 255;
			}
			else
			{
				return false; //does not react with the first particle
			}
		}
		else
		{
			return false; //particle does not react with anything
		}
	},
	
	// check that the index is a plant and attempt to grow given the right conditions
	plantGrow: function(oldArray, newArray, index)
	{
		if(oldArray[index+1] == 248)
		{
			var iabove = this.above(index);
			if(this.isPlant(newArray, this.below(index)) || this.isPlant(newArray, this.below(index-4)) || this.isPlant(newArray, this.below(index+4)) || this.isPlant(newArray, this.below(index-8)) || this.isPlant(newArray, this.below(index+8)) || this.isSand(newArray, this.below(index)) || this.isSand(newArray, this.below(index-4)) || this.isSand(newArray, this.below(index+4)) || this.isSand(newArray, this.below(index-8)) || this.isSand(newArray, this.below(index+8)))
			{
				if(this.positionExists(iabove-16))
				{
					//count how many plant blocks are above this one within 7 squares
					var plantCount = 0;
					
					if(this.isPlant(newArray, iabove)){plantCount++;}
					if(this.isPlant(newArray, iabove-4)){plantCount++;}
					if(this.isPlant(newArray, iabove+4)){plantCount++;}
					if(plantCount < 3 && this.isPlant(newArray, iabove+8)){plantCount++;}
					if(plantCount < 3 && this.isPlant(newArray, iabove-8)){plantCount++;}
					if(plantCount < 3 && this.isPlant(newArray, iabove+12)){plantCount++;}
					if(plantCount < 3 && this.isPlant(newArray, iabove-12)){plantCount++;}
					if(plantCount < 3 && this.isPlant(newArray, iabove+16)){plantCount++;}
					if(plantCount < 3 && this.isPlant(newArray, iabove-16)){plantCount++;}
					
					//grow if it's clear enough
					if(plantCount < 2)
					{
						switch(Math.floor((Math.random() * 5)))
						{
							case 0:
								if(this.isWater(newArray, iabove-4))
								{
									this.setPlant(iabove-4);
								}
							break;
							
							case 1:
								if(this.isWater(newArray, iabove))
								{
									this.setPlant(iabove);
								}
							break;
							
							case 2:
								if(this.isWater(newArray, iabove+4))
								{
									this.setPlant(iabove+4);
								}
							break;
							
							case 3:
								if(this.isWater(newArray, iabove+8))
								{
									this.setPlant(iabove+8);
								}
							break;
							
							case 4:
								if(this.isWater(newArray, iabove-8))
								{
									this.setPlant(iabove-8);
								}
							break;
						}
					}
				}
			}
			else
			{
				if(Math.floor((Math.random() * 2)) == 1)
				{
					this.setdeadPlant(index)
				}
			}
		}
	},
	
	//clears space
	setBlack: function(index)
	{
		this.newFrameArray[index] = 0;
		this.newFrameArray[index+1] = 0;
		this.newFrameArray[index+2] = 0;
	},
	
	//sets the block to plant
	setPlant: function(index)
	{
		this.newFrameArray[index] = 0;
		this.newFrameArray[index+1] = 248;
		this.newFrameArray[index+2] = 0;
	},
	
	//sets the block to plant
	setWater: function(index)
	{
		this.newFrameArray[index] = 0;
		this.newFrameArray[index+1] = 0;
		this.newFrameArray[index+2] = 255;
	},
	
	setStone: function(index)
	{
		this.newFrameArray[index] = 136;
		this.newFrameArray[index+1] = 136;
		this.newFrameArray[index+2] = 136;
	},
	
	setdeadPlant: function(index)
	{
		this.newFrameArray[index] = 140;
		this.newFrameArray[index+1] = 118;
		this.newFrameArray[index+2] = 86;
	},
	
	pauseGame: function()
	{
		this.paused = true;
		cancelAnimationFrame(this.animationID);
		this.update();
	},
	
	resumeGame: function()
	{
		cancelAnimationFrame(this.animationID);
		this.paused = false;
		this.update();
	},
	
	drawPauseScreen: function(ctx)
	{
		ctx.save();
		ctx.fillStyle = "black";
		//ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		//ctx.fillText(this.ctx, "... PAUSED ...", this.WIDTH/2, this.HEIGHT/2, "40pt courier", "white");
		//ctx.fillText(this.ctx, "By Thomas Bouffard", this.WIDTH/2, (3 * this.HEIGHT/4), "30pt courier", "white");
		ctx.restore();
	},
	
	clearScene: function()
	{
		this.ctx.save();
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
		this.ctx.restore();
	},
	
	lakeScene: function()
	{
		this.ctx.save();
		this.ctx.fillStyle = "#0000ff";
		this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
		this.ctx.restore();
	},
	
	lakeBedScene: function()
	{
		this.ctx.save();
		this.ctx.fillStyle = "#0000ff";
		this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
		this.ctx.fillStyle = "#EBEFA0";
		var sandfloor = Math.floor(this.HEIGHT / 7 * 6);
		this.ctx.fillRect(0, sandfloor, this.WIDTH, this.HEIGHT);
		this.ctx.fillStyle = "#00f800";
		
		// place plants on sand bed spaced at 1/3 and 2/3 width of the scene
		// note: dimensions must be an even integer in length or they are automatically anti-aliased
		this.ctx.fillRect(Math.floor(this.WIDTH / 4 * 3), sandfloor, 2, 2); 
		this.ctx.fillRect(Math.floor(this.WIDTH / 4), sandfloor, 2, 2);
		
		this.ctx.restore();
	},
	
	logScene: function()
	{
		console.log(this.oldFrameArray);
	}

}; // end app.main


// density layers (higher (position) is lighter)

// g/cm^3

// (crude) oil 0.87307
// water 1
// salt water 1.027
// sand 1.920
// salt 2.1