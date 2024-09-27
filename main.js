const BALL_NUMBER = 100;
const BALL_NUMBER_ALT = 30;
const canvas = document.querySelector("canvas");
const balls = [];

let canvasData = getCanvasData(canvas);
let animationFrameID = 0;

function getCanvasData(canvas) {
	return {
		ctx: canvas.getContext("2d"),
		width: (canvas.width = window.visualViewport.width),
		height: (canvas.height = window.visualViewport.height),
		screenDistance: Math.min(canvas.height, canvas.width),
	};
}

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRGB() {
	return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	sum(vec) {
		return new Vector(this.x + vec.x, this.y + vec.y);
	}

	subr(vec) {
		return this.sum(vec.negative());
	}

	dot(vec) {
		return this.x * vec.x + this.y * vec.y;
	}

	abs() {
		return Math.sqrt(this.dot(this));
	}

	rotateToAngle(alpha) {
		return new Vector(
			Math.cos(alpha) * this.x + Math.sin(alpha) * this.y,
			Math.sin(alpha) * this.x - Math.cos(alpha) * this.y
		);
	}

	getAngleX() {
		const acos = Math.acos(this.x / this.abs());
		return this.y > 0 ? acos : -acos;
	}

	negative() {
		return new Vector(-this.x, -this.y);
	}
}

class Ball {
	constructor(x, y, vx, vy, color, size) {
		this.r = new Vector(x, y);
		this.v = new Vector(vx, vy);
		this.color = color;
		this.size = size;
	}

	get m() {
		return this.size * this.size * this.size;
	}

	draw() {
		canvasData.ctx.beginPath();
		canvasData.ctx.fillStyle = this.color;
		let test = canvasData.screenDistance;
		canvasData.ctx.arc(this.r.x, this.r.y, this.size, 0, Math.PI * 2.0);
		canvasData.ctx.fill();
	}

	update() {
		if (this.r.x + this.size >= canvasData.width) {
			this.v.x = -this.v.x;
		}

		if (this.r.x - this.size <= 0) {
			this.v.x = -this.v.x;
		}

		if (this.r.y + this.size >= canvasData.height) {
			this.v.y = -this.v.y;
		}

		if (this.r.y - this.size <= 0) {
			this.v.y = -this.v.y;
		}

		this.r.x += this.v.x;
		this.r.y += this.v.y;
	}

	collide(ball) {
		const v0 = this.v;
		const dv = ball.v.subr(v0);
		const dr = ball.r.subr(this.r);

		let test;

		if ((test = dv.dot(dr) < 0)) {
			const alpha = dr.getAngleX();
			const dv_tr = dv.rotateToAngle(alpha);
			const v1x_ = (2 / (1 + this.m / ball.m)) * dv_tr.x;
			const v2x_ = dv_tr.x - (this.m / ball.m) * v1x_;
			let v1 = new Vector(v1x_, 0);
			let v2 = new Vector(v2x_, dv_tr.y);
			v1 = v1.rotateToAngle(alpha).sum(v0);
			v2 = v2.rotateToAngle(alpha).sum(v0);

			this.v = v1;
			ball.v = v2;
		}
	}
}

function init() {
	balls.length = 0;

	while (
		balls.length <
		(canvasData.screenDistance > 800 ? BALL_NUMBER : BALL_NUMBER_ALT)
	) {
		const size = (random(10, 15) * canvasData.screenDistance) / 1000;
		const ball = new Ball(
			random(0 + size, canvasData.width - size),
			random(0 + size, canvasData.height - size),
			random(-7, 7),
			random(-7, 7),
			randomRGB(),
			size
		);

		balls.push(ball);
	}

	balls.push(
		new Ball(
			canvasData.width / 2,
			canvasData.height / 2,
			0,
			0,
			"grey",
			0.06 * canvasData.screenDistance
		)
	);
}

function loop(currentTime) {
	canvasData.ctx.fillStyle = "rgb(0 0 0 / 25%)";
	canvasData.ctx.fillRect(0, 0, canvasData.width, canvasData.height);

	for (let i = 0; i < balls.length; ++i) {
		for (let j = i + 1; j < balls.length; ++j) {
			const distance = balls[i].r.subr(balls[j].r).abs();

			if (distance < balls[i].size + balls[j].size) {
				//balls[i].color = balls[j].color = randomRGB();
				balls[i].collide(balls[j]);
			}
		}
		balls[i].draw();
		balls[i].update();
	}

	animationFrameID = requestAnimationFrame(loop);
}

init();
loop();

addEventListener("resize", (event) => {
	canvasData = getCanvasData(canvas);
	cancelAnimationFrame(animationFrameID);
	init();
	loop();
});
