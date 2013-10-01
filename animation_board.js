window.createAnimationBoard = function (svgElem, height, width) {
	
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
			simulation.eachParticle(function (id, particle) {
				var circle = particleElems[id];
				circle.setAttribute("cx", particle.x);
				circle.setAttribute("cy", particle.y);
			});
		},
		createParticle: function(state, timestamp) {
			var circle = makeSVG('circle', { 
				cx: state.x, cy: state.y, r: state.r, 
				stroke: "black", "stroke-width": 1, fill: state.color
			});
			svgElem.insertBefore(circle);
			var id = simulation.createParticle(state, timestamp);
			circle.setAttribute("data-particle-id", id);
			particleElems[id] = circle;
		},
		deleteParticle: function (id, timestamp) {
			simulation.deleteParticle(id, timestamp);
			svgElem.removeChild(particleElems[id]);
		},
		resize: simulation.resize
	}; 
}




