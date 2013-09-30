window.createSimulation = function (initHeight, initWidth) {

	var height = initHeight;
	var width = initWidth;

	var particles = {};
	var nextParticleId = 0;

	var events = createEventQueue(); 

	function moveParticles(timestamp) {
		for (var id in particles) {
			if (particles.hasOwnProperty(id)) {
				particles[id].move(timestamp);
			}
		}
	}

	function predictNextCollision(particle) {
		function timeToHitWall(coord, speed, size) {
			if (speed == 0)
				return Infinity;
			var dist = speed > 0 ? size - coord - particle.r : coord - particle.r;
			if (dist < 0)
				return 0;
			else
				return dist / Math.abs(speed);
		}
		function bounceOffHorizontalWall() {
			particle.vy = -particle.vy;
		}
		function bounceOffVerticalWall() {
			particle.vx = -particle.vx;
		}
		var hrz = timeToHitWall(particle.y, particle.vy, height)	
		var vrt = timeToHitWall(particle.x, particle.vx, width);	
		if (hrz < vrt) {
			particle.addEndEvt(hrz);
			return { 
				timestamp: particle.startEvt.timestamp + hrz, 
				effect: bounceOffHorizontalWall, 
				particles: [particle] 
			};
		} else {
			particle.addEndEvt(vrt);
			return { 
				timestamp: particle.startEvt.timestamp + vrt, 
				effect: bounceOffVerticalWall, 
				particles: [particle] 
			};
		}
	}

	function createParticle(that, timestamp) {
		that.startEvt = {
			x: that.x,
			y: that.y,
			timestamp: timestamp
		};
		that.move = function (timestamp) {
			var progress = 
				(timestamp - that.startEvt.timestamp) / 
				(that.endEvt.timestamp - that.startEvt.timestamp); 
			that.x = that.startEvt.x + (that.endEvt.x - that.startEvt.x) * progress;
			that.y = that.startEvt.y + (that.endEvt.y - that.startEvt.y) * progress;
		}
		that.addEndEvt = function (dt) {
			var start = that.startEvt;
			that.endEvt = {
				x: start.x + that.vx*dt,
				y: start.y + that.vy*dt,
				timestamp: start.timestamp + dt
			}
		}
		return that;
	}

	return {
		createParticle: function (state, timestamp) {
			var particle = createParticle(state, timestamp);
			var collision = predictNextCollision(particle);
			events.insert(collision);
			//change other events
			var id = nextParticleId++;
			particles[id] = particle;
			return id;
		},
		/*deleteParticle: function (state) {
			delete particles[id];
		},*/
		update: function (timestamp) {
			var event = events.popIfHappened(timestamp);
			while (event) {
				moveParticles(event.timestamp);
				event.effect();
				for (var i = 0; i < event.particles.length; i++) {
					var particle = event.particles[i];
					particle.startEvt = particle.endEvt;
					var collision = predictNextCollision(particle);
					events.insert(collision);
				}
				event = events.popIfHappened(timestamp);
			}
			moveParticles(timestamp);
		},
		eachParticle: function (func) {
			for (var id in particles) {
				if (particles.hasOwnProperty(id)) {
					func(id, particles[id]);
				}
			}	
		}
	};
}