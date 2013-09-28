(function (svg) {

	function makeSVG(tag, attrs) {
		var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
		for (var k in attrs)
			el.setAttribute(k, attrs[k]);
		return el;
	}

	var particles = [];

	function createParticle(initX, initY, initR) {
		var circle = makeSVG('circle', { 
			cx: initX, cy: initY, r: initR, 
			stroke: "black", "stroke-width": 1, fill: "red"
		});
		svg.insertBefore(circle);

		function svgResize(width, height) {
			svg.setAttribute("width", width + "px");
			svg.setAttribute("height", height + "px");
		}

		svgResize(300, 300);

		var state = {
			x: initX,
			y: initY,
			r: initR,
			vx: 0,
			vy: 0
		};
		
		var that = {
		};
		particles.push(that);
		return that;
	};

	createParticle(100, 100, 30);

}(document.getElementsByTagName("svg")[0]));