"use strict";

//app singleton
var app = app || {};


window.onload = function(){
	//app.sound.init();
	//app.main.sound = app.sound;
	app.main.init();
	window.addEventListener('resize', resizeCanvas, false);
	resizeCanvas();
};

window.onblur = function()
{
	if(!document.getElementById("backgroundRunSwitch").checked)
	{
		app.main.pauseGame();
	}
};

window.onfocus = function()
{
	app.main.resumeGame();
};