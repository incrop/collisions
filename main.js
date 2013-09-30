(function () {
	function init(timestamp) {
		var svgElem = document.getElementsByTagName("svg")[0];
		var board = createAnimationBoard(svgElem, 200, 200);
		function redrawBoard(timestamp) {
			board.redraw(timestamp);
			requestAnimationFrame(redrawBoard);
		}
		board.createParticle({ x: 50, y: 70, r: 10, vx: 0.1, vy: 0.05, color: "green" }, timestamp);
		board.createParticle({ x: 140, y: 20, r: 15, vx: 0.12, vy: -0.15, color: "yellow" }, timestamp);
		requestAnimationFrame(redrawBoard);
	}
	requestAnimationFrame(init);
}());