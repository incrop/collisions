$(document).ready(function () {
	function init(timestamp) {
		var $svg = $("svg");
		$win = $(window);
		var board = createAnimationBoard($svg[0], $win.height(), $win.width());
		var resize = false;
		var deleteParticles = [];
		var createParticles = [];
		function redrawBoard(timestamp) {
			if (resize) {
				resize = false;
				board.resize($win.height(), $win.width(), timestamp);
			}
			while (deleteParticles.length > 0) {
				board.deleteParticle(deleteParticles.pop(), timestamp);
			}
			while (createParticles.length > 0) {
				board.createParticle(createParticles.pop(), timestamp);
			}
			board.redraw(timestamp);
			requestAnimationFrame(redrawBoard);
		}

		$win.resize(function() {
			resize = true;
		});
		$svg.on("mousedown", "circle", function() {
			deleteParticles.push($(this).data("particle-id"));
		});
		var colors = ["silver", "gray", "red", "maroon", "yellow", 
			"olive", "lime", "green", "aqua", "teal", "blue", "navy", "fuchsia", "purple"];
		function randomBetween(a, b) {
			return a + Math.random() * (b - a);
		}
		$win.click(function(event) {
			var r  = randomBetween(10, 50);
			var vx = randomBetween(-0.2, 0.2);
			var vy = randomBetween(-0.2, 0.2);
			var color = colors[Math.ceil(Math.random() * colors.length)];
			createParticles.push({ x: event.pageX, y: event.pageY, r: r, vx: vx, vy: vy, color: color });
		});

		requestAnimationFrame(redrawBoard);
	}
	requestAnimationFrame(init);
});