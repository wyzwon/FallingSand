// main.js
// Dependencies: 
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};


app.main = {
	//properties
	paused: false,
	animationID: 0,
	
    WIDTH : 600, 
    HEIGHT: 400,
	WIDTHPIX: undefined,
	HEIGHTPIX: undefined,
    canvas: undefined,
    ctx: undefined,
	dragging: undefined,
	penSize: undefined,
   	lastTime: 0, // used by calculateDeltaTime() 
	
	imageData: undefined,
	data: undefined,
	rawData: undefined,
	sandColor: "#EBEFA0",


	
    // methods
	init : function() {
		console.log("app.main.init() called");
		// initialize properties
		this.canvas = document.querySelector('canvas');
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
		
		this.sandColor= "#EBEFA0";
		
		this.setupUI();

		
		// start the scene loop
		this.update();
	},
	
	
	update: function(){

	 	this.animationID = requestAnimationFrame(this.update.bind(this));
	 	
		if(this.paused)
		{
			//this.drawPauseScreen(this.ctx);
			return;
		}
	 	
		
	 	var dt = this.calculateDeltaTime();
	 	 

		
		this.imageData = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
		this.data = this.imageData.data; //data to manipulate
		this.rawData = this.data.slice(0); //unmodified data to reference
		
		//iterate through every cell in the canvas
		for(var i = 0; i < this.data.length; i += 4)
		{
			//if position has a color
			if(!this.isBlack(this.rawData, i))
			{
				//if the particle is the same in both arrays (aka: has not been modified)
				if((this.rawData[i] == this.data[i]) && (this.rawData[i+1] == this.data[i+1]) && (this.rawData[i+2] == this.data[i+2]))
				{
					//if the focused particle is fluid
					if(this.isFluid(i,this.rawData))
					{
						//position below exists
						if(this.positionExists(this.below(i), this.rawData))
						{
							//check if space below is empty
							if(this.isBlack(this.rawData, this.below(i)))
							{
								
								this.moveParticle(i, this.rawData, this.below(i), this.data);
								
							}
							
							//attempt to merge
							else if(this.tryMerge(i,this.below(i)))
							{
								//there was no reason not to put the merge code in the logic used to check if it was even possible
							}
							
							
							//attempt to sink
							else if(this.isFluid(this.below(i), this.rawData) && (this.isDenser(i, this.rawData, this.below(i))) && (Math.floor((Math.random() * 2)) == 1)) //if the particle below is fluid and less dense
							{
								
								this.switchCells(i, this.rawData, this.below(i), this.data);
								
							}
							
							//check sides
							else
							{
		
								//try to move left or right
								if(Math.floor((Math.random() * 2)) == 1)
								{
									if(this.isBlack(this.rawData, i-4))//(this.rawData[i-4] == 0) && (this.rawData[i-3] == 0) && (this.rawData[i-2] == 0))
									{
										if(this.isBlack(this.data, (i-4)))//(this.data[i-4] == 0) && (this.data[i-3] == 0) && (this.data[i-2] == 0))
										{
											
											this.moveParticle(i, this.rawData, (i-4), this.data);
											
										}
										
									}
								}
								else
								{
									if(this.isBlack(this.rawData, i+4))//(this.rawData[i+4] == 0) && (this.rawData[i+5] == 0) && (this.rawData[i+6] == 0))
									{
										if(this.isBlack(this.data, (i+4)))//t(this.data[i+4] == 0) && (this.data[i+5] == 0) && (this.data[i+6] == 0))
										{
											
											this.moveParticle(i, this.rawData, (i+4), this.data);
											
										}
									}
								}
							}
						}
					}
				}
			}
		}

		
		//apply changes
		this.ctx.putImageData(this.imageData, 0, 0);
		

		//console.log(this.animationID);
	

	

		

	},
	
	

	
	calculateDeltaTime: function(){
		// + calls Date.valueOf(), which converts it from an object to a 	
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},
	
	
	
	

	
    
	
	
	
	doMousedown: function(e)
	{
		this.dragging = true;
		
		var mouse = getMouse(e);
		
		this.ctx.fillStyle = this.sandColor;


		
		
		//this.ctx.beginPath();
		//this.ctx.arc(mouse.x,mouse.y,30,0,2*Math.PI);
		//this.ctx.fill();

	},
	
	
	doMousemove: function(e)
	{
	
		//bail out if the mouse button is not down
 		if(! this.dragging) return;
		
		//get location of mouse in canvas coordinates
		var mouse = getMouse(e);
		

		this.ctx.fillStyle = this.sandColor;
		//this.ctx.lineWidth = lineWidth;
		
		//this.ctx.lineTo(mouse.x + 0.5,mouse.y + 0.5);
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
	
	
	//check if the position physically exists in the array
	positionExists: function(indexToCheck)
	{
		return( indexToCheck < this.rawData.length);
		
		//code snippet saved to block wrap around if I feel it should be done
		
		/*if(indexToCheck != undefined)
		{
			if((indexToCheck % this.WIDTHPIX) == (this.WIDTHPIX - 1) || ((indexToCheck % this.WIDTHPIX) == (0)))
			{
				return false;
			}
			else
			{
				return true;
			}
			return true;
		}
		else
		{
			return false;
		}*/
	},
	
	//checks if black
	isBlack: function(data, indexLocation)
	{
		return((data[indexLocation] == 0) && (data[indexLocation+1] == 0) && (data[indexLocation+2] == 0));
		
	},
	
	
	//move particle (this moves it then erases the old space)
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
				//console.log("sandColor after change: " + this.sandColor);
			}.bind(this);
			
		document.querySelector("#PenSize").onchange = function(e){
				this.penSize = e.target.value;
			}.bind(this);
	},
	
	//swap two given cells
	switchCells: function(index1, array1, index2, array2 )
	{
		
		
		array2[index1] = array1[index2];
		array2[index1+1] = array1[index2+1];
		array2[index1+2] = array1[index2+2];
		array2[index1+3] = array1[index2+3];
		
		array2[index2] = array1[index1];
		array2[index2+1] = array1[index1+1];
		array2[index2+2] = array1[index1+2];
		array2[index2+3] = array1[index1+3];
		//debugger;
	},
	
	
	isFluid: function(index,array)
	{
		return (!(array[index] == 136)); //use till there are more solids
		/*var foo = array[index];
		if(array[index] == 136) //hex 88 -> dec 136
		{
			return false;
		}
		else
		{
			return true;
		}*/
	},
	
	getDensity: function(rValue, gValue, bValue)
	{
		if((rValue > 0) && (rValue < 255))
		{
			if(rValue == 235)//sand //hex EB == dec 235
			{
				return 3;
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
		else
		{
			return 0;//unknown but hey let it float
		}
		
	},
	
	//declare if object one is denser then object two
	isDenser: function(index1, array, index2) // object1 array object2
	{
		return(this.getDensity(array[index1], array[index1+1], array[index1+2]) > this.getDensity(array[index2], array[index2+1], array[index2+2]));
	},
	
	//returns the index below focused cells
	below: function(index)
	{
		return (index + this.WIDTHPIX);
	},
	
	tryMerge: function(index,lowerIndex)
	{
		
		//determine the first object and compare the second to its list of reactants then reacts if able
		if((this.rawData[index] == 255) && (this.rawData[index+1] == 255) && (this.rawData[index + 2] == 255)) //is salt
		{
			
			if((this.rawData[lowerIndex] == 0) && (this.rawData[lowerIndex+1] == 0) && (this.rawData[lowerIndex + 2] == 255)) //is water
			{
				//set upper to black
				this.setBlack(index);
				
				//set lower to merge result (saltwater)
				this.data[lowerIndex] = 170;
				this.data[lowerIndex+1] = 204;
				this.data[lowerIndex+2] = 255;
			}
			else
			{
				return false; //does not react with the first particle
			}
		}
		else if((this.rawData[index] == 0) && (this.rawData[index+1] == 0) && (this.rawData[index + 2] == 255)) //is water
		{
			if((this.rawData[lowerIndex] == 255) && (this.rawData[lowerIndex+1] == 255) && (this.rawData[lowerIndex + 2] == 255)) //is salt
			{
				//set upper to black
				this.setBlack(index);
				
				//set lower to merge result (saltwater)
				this.data[lowerIndex] = 170;
				this.data[lowerIndex+1] = 204;
				this.data[lowerIndex+2] = 255;
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
	
	//clears space
	setBlack: function(index)
	{
		this.data[index] = 0;
		this.data[index+1] = 0;
		this.data[index+2] = 0;
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
	}
	
}; // end app.main


//density layers (higher is lighter)


//water 1
//salt water 1.027
//sand 1.920
//salt 2.17
