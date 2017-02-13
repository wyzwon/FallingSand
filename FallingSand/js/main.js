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
	//paused: false,
	animationID: 0,
	
    WIDTH : 600, 
    HEIGHT: 400,
	WIDTHPIX: undefined,
	HEIGHTPIX: undefined,
    canvas: undefined,
    ctx: undefined,
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
		
		this.WIDTHPIX = this.WIDTH * 4,
		this.HEIGHTPIX = this.HEIGHT * 4,
		
		this.ctx.fillStyle = "black"; 
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
		
		this.canvas.onmousedown = this.doMousedown.bind(this);
		
		this.sandColor= "#EBEFA0";
		
		this.setupUI();

		
		// start the scene loop
		this.update();
	},
	
	
	update: function(){
		// 1) LOOP
		// schedule a call to update()
	 	this.animationID = requestAnimationFrame(this.update.bind(this));
	 	

	 	
	 	// 3) HOW MUCH TIME HAS GONE BY?
	 	var dt = this.calculateDeltaTime();
	 	 

		
		this.imageData = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
		this.data = this.imageData.data;
		this.rawData = this.data.slice(0);
		
		//slow down the cycle
		//if(this.animationID % 1) == 0)
		//{
			for(var i = 0; i < this.data.length; i += 4)
			{
				//if position has a color
				if(!this.isBlack(this.rawData, i))
				{
					//position bellow exists
					if(this.positionExists(i + this.WIDTHPIX))
					{
						//check if there is an object below
						if(this.isBlack(this.rawData, (i + this.WIDTHPIX)))
						{
							
							this.moveParticle(i, this.rawData, (i+this.WIDTHPIX), this.data);
							
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
			//console.log("updated");
		//}
		
		//apply changes
		this.ctx.putImageData(this.imageData, 0, 0);
		

		//console.log(this.animationID);
	

	

		

	},
	
	

	
	calculateDeltaTime: function(){
		// what's with (+ new Date) below?
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
		
		
		var mouse = getMouse(e);
		
		this.ctx.fillStyle = this.sandColor;//"#EBEFA0";
		console.log("sandColor whilesetting fillStyle: " + this.sandColor);

		//this.ctx.fillRect(mouse.x,mouse.y,1,1);
		
		this.ctx.fillRect(mouse.x - 15, mouse.y - 15, 30, 30);
		
		//this.ctx.beginPath();
		//this.ctx.arc(mouse.x,mouse.y,30,0,2*Math.PI);
		//this.ctx.fill();

	},
	
	
	
	positionExists: function(indexToCheck)
	{
		if(indexToCheck != undefined)
		{
			//if((indexToCheck % this.WIDTHPIX) == (this.WIDTHPIX - 1) || ((indexToCheck % this.WIDTHPIX) == (0)))
			//{
			//	return false;
			//}
			//else
			//{
			//	return true;
			//}
			return true;
		}
		else
		{
			return false;
		}
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
	
	setupUI: function()
	{
		document.querySelector("#sandType").onchange = function(e){
				//this.sandColor = e.target.value;
				this.setSandColor(e.target.value);
				console.log("sandColor after change: " + this.sandColor);
			};
	},
	
}; // end app.main