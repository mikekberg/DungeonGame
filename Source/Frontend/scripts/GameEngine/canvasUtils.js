/// <reference path="../Libraries/jquery-1.6.2.js" />

var CanvasUtils = {
	getCursorPosition: function(e) {
		var x;
		var y;
		if (e.pageX != undefined && e.pageY != undefined) {
			return { x: e.pageX,
					 y: e.pageY
				   };
		}
		else {
			return { x: e.clientX + document.body.scrollLeft +
						document.documentElement.scrollLeft,
					 y: e.clientY + document.body.scrollTop +
						document.documentElement.scrollTop
				   };
		}
	},
	resizeCanvas: function(event) {
		ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerHeight;
	},
};