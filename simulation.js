window.createSimulation = function (initHeight, initWidth) {
	var maxV = 0.5;
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

	function predictNextCollision(particle, timestamp) {
		particle.startEvt = {
			x: particle.x,
			y: particle.y,
			timestamp: timestamp
		};

		function timeToHitWall(coord, speed, size) {
			if (speed == 0)
				return Infinity;
			var dist = speed > 0 ? size - coord - particle.r : coord - particle.r;
			if (dist < 0)
				return 0;
			else
				return dist / Math.abs(speed);
		}
		function timeToHitParticle(another) {
			if (particle === another) return Infinity;
			var dx  = another.x  - particle.x,  dy = another.y  - particle.y;
			var dvx = another.vx - particle.vx, dvy = another.vy - particle.vy;
			var dvdr = dx*dvx + dy*dvy;
			if (dvdr > 0) return Infinity;
			var dvdv = dvx*dvx + dvy*dvy;
			var drdr = dx*dx + dy*dy;
			var sigma = particle.r + another.r;
			var d = (dvdr*dvdr) - dvdv * (drdr - sigma*sigma);
			if (d < 0) return Infinity;
			return -(dvdr + Math.sqrt(d)) / dvdv;
		}
		var hrz = timeToHitWall(particle.y, particle.vy, height)	
		var vrt = timeToHitWall(particle.x, particle.vx, width);
		var prt = Infinity;
		var another;
		for (var id in particles) {
			if (particles.hasOwnProperty(id)) {
				var currPrt = timeToHitParticle(particles[id]);
				if (currPrt < prt) {
					prt = currPrt;
					another = particles[id];
				}
			}
		}
		function bounceOffHorizontalWall() {
			particle.vy = -particle.vy;
		}
		function bounceOffVerticalWall() {
			particle.vx = -particle.vx;
		}
		function bounceOffParticle() {
			var dx  = another.x  - particle.x,  dy = another.y  - particle.y;
			var dvx = another.vx - particle.vx, dvy = another.vy - particle.vy;
			var dvdr = dx*dvx + dy*dvy;
			var dist = particle.r + another.r;
			var J = 2*particle.m*another.m*dvdr/((particle.m+another.m)*dist);
			var Jx = J*dx/dist;
			var Jy = J*dy/dist;
			particle.vx += Jx / particle.m;
			particle.vy += Jy / particle.m;
			another.vx -= Jx / another.m;
			another.vy -= Jy / another.m;
			var v = Math.max(Math.abs(particle.vx), Math.abs(particle.vy), 
				Math.abs(another.vx), Math.abs(another.vy));
			if (v > maxV) {
				var coeff = maxV/v;
				particle.vx *= coeff;
				particle.vy *= coeff;
				another.vx *= coeff;
				another.vy *= coeff;
			}
		}
		var min = Math.min(hrz, vrt, prt)
		if (min === hrz) {
			particle.addEndEvt(hrz);
			var collision = { 
				active: true,
				timestamp: particle.startEvt.timestamp + hrz, 
				effect: bounceOffHorizontalWall, 
				particles: [particle] 
			};
			particle.collision = collision;
			return collision;
		} else if (min === vrt) {
			particle.addEndEvt(vrt);
			var collision = {
				active: true, 
				timestamp: particle.startEvt.timestamp + vrt, 
				effect: bounceOffVerticalWall, 
				particles: [particle] 
			};
			particle.collision = collision;
			return collision;
		} else {
			particle.addEndEvt(prt);
			var collision = {
				active: true, 
				timestamp: particle.startEvt.timestamp + prt, 
				effect: bounceOffParticle, 
				particles: [particle, another] 
			};
			particle.collision = collision;
			if (collision.timestamp < another.collision.timestamp) {
				another.addEndEvt(prt);
				another.collision.active = false;
				another.collision = collision
			}	
			return collision;		
		}
	}

	function createParticle(that) {
		that.move = function (timestamp) {
            if (Math.abs(that.startEvt.timestamp - that.endEvt.timestamp) < 10) {
                that.x = that.endEvt.x; 
                that.y = that.endEvt.y; 
            } else {
				var progress = 
					(timestamp - that.startEvt.timestamp) / 
					(that.endEvt.timestamp - that.startEvt.timestamp); 
				that.x = that.startEvt.x + (that.endEvt.x - that.startEvt.x) * progress;
				that.y = that.startEvt.y + (that.endEvt.y - that.startEvt.y) * progress;            	
            }
		}
		that.addEndEvt = function (dt) {
			var start = that.startEvt;
			that.endEvt = {
				x: start.x + that.vx*dt,
				y: start.y + that.vy*dt,
				timestamp: start.timestamp + dt
			}
		}
		that.m = Math.PI * that.r * that.r;
		return that;
	}

	return {
		createParticle: function (state, timestamp) {
			var particle = createParticle(state);
			events.insert(predictNextCollision(particle, timestamp));
			var id = nextParticleId++;
			particles[id] = particle;
			return id;
		},
		deleteParticle: function (id, timestamp) {
			var particle = particles[id];
			delete particles[id];
			particle.collision.active = false;
			for (var i = 0; i < particle.collision.particles.length; i++) {
				var another = particle.collision.particles[i];
				if (another !== particle)
					events.insert(predictNextCollision(another, timestamp));
			}
		},
		update: function (timestamp) {
			var event = events.popIfHappened(timestamp);
			while (event) {
				if (event.active) {
					moveParticles(event.timestamp);
					event.effect();
					for (var i = 0; i < event.particles.length; i++) {
						var particle = event.particles[i];
						events.insert(predictNextCollision(particle, timestamp));
					}
				}
				event = events.popIfHappened(timestamp);
			}
			moveParticles(timestamp);
		},
		resize: function (newHeight, newWidth, timestamp) {
			height = newHeight;
			width = newWidth;
			for (var id in particles) {
				if (particles.hasOwnProperty(id)) {
					particles[id].collision.active = false;
					events.insert(predictNextCollision(particles[id], timestamp));
				}
			}
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