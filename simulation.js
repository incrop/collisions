window.createSimulation = function (initHeight, initWidth) {

	function createParticle(state) {		
		function timeToHitWall(coord, speed, size) {
			return speed > 0 ? (size - coord - state.r) / speed 
			     : speed < 0 ? (state.r - coord) / speed
			     : Infinity;
		}
		function collisionWithWall(coord, speed, size, dt) {
			var futureCoord = coord + speed*dt;
			return futureCoord < state.r || futureCoord > size - state.r;
		}
		return {
			state: state,
			timeToHitHorizontalWall: function () {
				return timeToHitWall(state.x, state.vx, svgWidth);
			},
			timeToHitVerticalWall: function () {
				return timeToHitWall(state.y, state.vy, svgHeight);
			},
			move: function (dt) {
				state.x += state.vx * dt;
				state.y += state.vy * dt;
			},
			predictCollision: function () {
				var hrz = this.timeToHitHorizontalWall();	
				var vrt = this.timeToHitVerticalWall();	
				var what, when;
				if (hrz < vrt) {
					return { type: "horizontal", time: hrz };
				} else {
					return { type: "vertical", time: vrt };
				}
			}
		};
	}
	
	var particles = {};
	var nextParticleId = 0;
	var prevTimestamp = null; 

	return {
		createParticle: function (state) {
			var id = nextParticleId++;
			particles[id] = createParticle(state);
			return id;
		},
		deleteParticle: function (state) {
			delete particles[id];
		},
		update: function (timestamp) {
			if (prevTimestamp === null) prevTimestamp = timestamp;
			var dt = timestamp - prevTimestamp;
			for (var id in particles) {
				if (particles.hasOwnProperty(id)) {
					particles[id].move(dt);
				}
			}
		},
		eachParticle: function (func) {
			for (var id in particles) {
				if (particles.hasOwnProperty(id)) {
					func(id, particles[id].state);
				}
			}	
		}
	};
}