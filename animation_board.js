window.createAnimationBoard = function (svgElem, height, width) {

	svgElem.setAttribute("width", width + "px");
	svgElem.setAttribute("height", height + "px");
	
	function makeSVG(tag, attrs) {
		var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
		for (var k in attrs)
			el.setAttribute(k, attrs[k]);
		return el;
	}

	var simulation = createSimulation(height, width);
	var particleElems = {};

	return {
		redraw: function (timestamp) {
			simulation.update(timestamp);
			simulation.eachParticle(function (id, state) {
				var circle = particleElems[id];
				circle.setAttribute("cx", state.x);
				circle.setAttribute("cy", state.y);
			});
		},
		createParticle: function(state) {
			var circle = makeSVG('circle', { 
				cx: state.x, cy: state.y, r: state.r, 
				stroke: "black", "stroke-width": 1, fill: "red"
			});
			svgElem.insertBefore(circle);
			var id = simulation.createParticle(state);
			circle.setAttribute("data-particle-id", id);
			particleElems[id] = circle;
		},
		deleteParticle: function (id) {
			simulation.deleteParticle(id);
			svgElem.removeChild(particleElems[id]);
		},
		resize: function (height, width) {
			simulation.resize(height, width);
			svgElem.setAttribute("width", width + "px");
			svgElem.setAttribute("height", height + "px");
		}
	}; 
}




