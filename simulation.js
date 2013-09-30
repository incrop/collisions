window.createSimulation = function (initTimestamp, initHeight, initWidth) {

	var height = initHeight;
	var width = initWidth;
	var prevTimestamp = initTimestamp;

	function createParticle(state) {		
		function timeToHitWall(coord, speed, size) {
			return speed > 0 ? (size - coord - state.r) / speed 
			     : speed < 0 ? (state.r - coord) / speed
			     : Infinity;
		}
		var bounceOffHorizontalWall = function () {
			state.vy = -state.vy;
		}
		var bounceOffVerticalWall = function () {
			state.vx = -state.vx;
		}
		function collisionWithWall(coord, speed, size, dt) {
			var futureCoord = coord + speed*dt;
			return futureCoord < state.r || futureCoord > size - state.r;
		}
		return {
			state: state,
			timeToHitHorizontalWall: function () {
				return timeToHitWall(state.x, state.vx, width);
			},
			timeToHitVerticalWall: function () {
				return timeToHitWall(state.y, state.vy, height);
			},
			move: function (dt) {
				state.x += state.vx * dt;
				state.y += state.vy * dt;
			},
			nextCollision: function () {
				var hrz = this.timeToHitHorizontalWall();	
				var vrt = this.timeToHitVerticalWall();	
				var what, when;
				if (hrz < vrt) {
					return { 
						timestamp: prevTimestamp + hrz, 
						effect: bounceOffHorizontalWall, 
						particles: [this] 
					};
				} else {
					return { 
						timestamp: prevTimestamp + vrt, 
						effect: bounceOffVerticalWall, 
						particles: [this] 
					};
				}
			}
		};
	}

	var particles = {};
	var nextParticleId = 0;

	var events = createEventQueue(); 

	function moveParticles(timestamp) {
		var dt = timestamp - prevTimestamp;
		for (var id in particles) {
			if (particles.hasOwnProperty(id)) {
				particles[id].move(dt);
			}
		}
	}

	return {
		createParticle: function (state) {
			var p = createParticle(state);
			events.insert(p.nextCollision());
			//change other events
			var id = nextParticleId++;
			particles[id] = p;
			return id;
		},
		deleteParticle: function (state) {
			delete particles[id];
		},
		update: function (timestamp) {
			var event = events.popIfHappened(timestamp);
			while (event) {
				moveParticles(event.timestamp);
				event.effect();
				for (var i = 0; i < event.particles.length; i++) {
					var p = event.particles[i];
					var collision = p.nextCollision();
					events.insert(prevTimestamp + collision.time, collision);
				}
				event = events.popIfHappened(timestamp);
			}
			moveParticles(timestamp);
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