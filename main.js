(function () {
	var svgElem = document.getElementsByTagName("svg")[0];
	var board = createAnimationBoard(svgElem, 500, 500);
	board.createParticle({ x: 50, y: 70, r: 10, vx: 0.002, vy: 0.001 });

	function redrawBoard(timestamp) {
		board.redraw(timestamp);
		requestAnimationFrame(redrawBoard);
	}
	requestAnimationFrame(redrawBoard);
}());