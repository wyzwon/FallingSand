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

		// start the game loop
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
				if(!this.isBlack(this.rawData, i))//(this.rawData[i] != 0) || (this.rawData[i+1] != 0) || (this.rawData[i+2] != 0))
				{
					//this will be replaced with a call to in boundry check
					//position bellow exists
					if((this.rawData.length + this.WIDTHPIX) < ((this.WIDTH * 4) * (this.HEIGHT * 4)))
					{
						//check if there is an object below
						if(this.isBlack(this.rawData, (i + this.WIDTHPIX)))//(this.rawData[i+this.WIDTHPIX] == 0) && (this.rawData[i+1+this.WIDTHPIX] == 0) && (this.rawData[i+2+this.WIDTHPIX] == 0))
						{
							this.data[i+this.WIDTHPIX] = this.rawData[i];
							this.data[i+this.WIDTHPIX+1] = this.rawData[i+1];
							this.data[i+this.WIDTHPIX+2] = this.rawData[i+2];
							
							this.data[i] = 0;
							this.data[i+1] = 0;
							this.data[i+2] = 0;
						}
						
						//check sides
						else
						{

							//try to move left or right
							if(Math.floor((Math.random() * 2)) == 1)
							{
								if((this.rawData[i-4] == 0) && (this.rawData[i-3] == 0) && (this.rawData[i-2] == 0))
								{
									if((this.data[i-4] == 0) && (this.data[i-3] == 0) && (this.data[i-2] == 0))
									{
										this.data[i-4] = this.rawData[i];
										this.data[i-3] = this.rawData[i+1];
										this.data[i-2] = this.rawData[i+2];
										
										this.data[i] = 0;
										this.data[i+1] = 0;
										this.data[i+2] = 0;
									}
									
								}
							}
							else
							{
								if((this.rawData[i+4] == 0) && (this.rawData[i+5] == 0) && (this.rawData[i+6] == 0))
								{
									if((this.data[i+4] == 0) && (this.data[i+5] == 0) && (this.data[i+6] == 0))
									{
										this.data[i+4] = this.rawData[i];
										this.data[i+5] = this.rawData[i+1];
										this.data[i+6] = this.rawData[i+2];
										
										this.data[i] = 0;
										this.data[i+1] = 0;
										this.data[i+2] = 0;
									}
									
								}
							}
						}
					}
					
					
					
				}
				//data[i];
				//data[i+1];
				//data[i+2];
				//data[i+3];
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
		
		this.ctx.fillStyle = "#EBEFA0";
		this.ctx.fill
		//this.ctx.fillRect(mouse.x,mouse.y,1,1);
		this.ctx.beginPath();
		this.ctx.arc(mouse.x,mouse.y,30,0,2*Math.PI);
		this.ctx.fill();

	},
	
	
	
	positionExists: function(fromRight, indexToCheck)
	{
		if(indexToCheck != undefined)
		{
			//if this block works it will be a miracle
			if(((fromRight == true) && ((indexToCheck % WIDTH) == (WIDTH - 1))) || (((fromRight == false) && ((indexToCheck % WIDTH) == (0)))))
			{
				return false;
			}
			else
			{
				return true;
			}
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
	
	
	
	
	
}; // end app.main