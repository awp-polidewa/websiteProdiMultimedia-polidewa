<script>
	import { onMount } from 'svelte';

	/** @type {HTMLCanvasElement} */
	let canvas;

	onMount(() => {
		const context = canvas?.getContext('2d');
		if (!context) return;

		const gap = 32;
		const stops = [
			[51, 51, 255],
			[61, 190, 255],
			[242, 200, 27],
			[30, 30, 48],
			[51, 51, 255]
		];
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let width = 0;
		let height = 0;
		let dpr = 1;
		/** @type {{ x: number, y: number, pick: number, offsetX: number, offsetY: number, tilt: number }[]} */
		let points = [];
		let mouseX = 0;
		let mouseY = 0;
		let targetX = 0;
		let targetY = 0;
		let hasPointer = false;
		let visible = !document.hidden;
		let animationFrame = 0;
		const startTime = performance.now();
		let lastTime = startTime;

		/** @param {number} value */
		const colorAt = (value) => {
			const normalized = ((value % 1) + 1) % 1;
			const position = normalized * (stops.length - 1);
			const index = Math.min(stops.length - 2, Math.floor(position));
			const fraction = position - index;
			const from = stops[index];
			const to = stops[index + 1];
			const rgb = from.map((channel, i) => Math.floor(channel + (to[i] - channel) * fraction));
			return `rgb(${rgb.join(',')})`;
		};

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			context.setTransform(dpr, 0, 0, dpr, 0, 0);
			points = [];

			const columns = Math.ceil(width / gap) + 1;
			const rows = Math.ceil(height / gap) + 1;
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < columns; x++) {
					const jitterX = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
					const jitterY = (Math.sin(x * 39.346 + y * 11.135) * 24634.6345) % 1;
					points.push({
						x: x * gap + (y % 2 ? gap / 2 : 0) + jitterX * 6,
						y: y * gap + jitterY * 6,
						pick: Math.abs((Math.sin(x * 7.13 + y * 3.71) * 9301.7) % 1),
						offsetX: 0,
						offsetY: 0,
						tilt: 0
					});
				}
			}

			targetX = mouseX = width * 0.72;
			targetY = mouseY = height * 0.55;
		};

		/** @param {PointerEvent} event */
		const onPointerMove = (event) => {
			const rect = canvas.getBoundingClientRect();
			targetX = event.clientX - rect.left;
			targetY = event.clientY - rect.top;
			hasPointer = true;
		};

		const onVisibilityChange = () => {
			visible = !document.hidden;
		};

		/** @param {number} now */
		const frame = (now) => {
			animationFrame = requestAnimationFrame(frame);
			if (!visible) return;

			const time = (now - startTime) / 1000;
			const dt = Math.min(0.05, (now - lastTime) / 1000);
			lastTime = now;

			if (!hasPointer) {
				targetX = width * (0.5 + 0.3 * Math.sin(time * 0.3));
				targetY = height * (0.52 + 0.24 * Math.sin(time * 0.4 + 1));
			}

			const mouseEase = 1 - Math.exp(-dt * 1.6);
			const pointEase = 1 - Math.exp(-dt * 5);
			mouseX += (targetX - mouseX) * mouseEase;
			mouseY += (targetY - mouseY) * mouseEase;

			context.clearRect(0, 0, width, height);
			const radius = Math.max(300, Math.min(width, height) * 0.62);

			for (const point of points) {
				const dx = point.x - mouseX;
				const dy = point.y - mouseY;
				const distance = Math.sqrt(dx * dx + dy * dy) + 0.001;
				const influence = Math.exp(-(distance * distance) / (radius * radius * 1.1));
				const wave = Math.sin(distance * 0.028 - time * (reduceMotion ? 0 : 1.25)) * influence;
				const angle = Math.atan2(dy, dx);
				const pick = point.pick > 0.6 ? 1 : 0.2;

				point.offsetX += ((dx / distance) * wave * 18 - point.offsetX) * pointEase;
				point.offsetY += ((dy / distance) * wave * 18 - point.offsetY) * pointEase;
				point.tilt += (((wave + 1) / 2) * influence * pick - point.tilt) * pointEase;

				const radiusSize = 0.8 + influence * 0.8;
				const shortAxis = radiusSize * (1 - point.tilt * 0.2);
				const longAxis = Math.max(shortAxis, radiusSize * (1 + point.tilt * 1.5) - point.tilt);

				context.globalAlpha = 0.05 + influence * 0.9 * (0.35 + 0.65 * pick);
				context.fillStyle = colorAt(angle / (Math.PI * 2) + 0.5 + distance * 0.0006 + time * 0.03);
				context.beginPath();
				context.ellipse(point.x + point.offsetX, point.y + point.offsetY, longAxis, shortAxis, angle, 0, Math.PI * 2);
				context.fill();
			}
			context.globalAlpha = 1;
		};

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		document.addEventListener('visibilitychange', onVisibilityChange);
		animationFrame = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	});
</script>

<canvas bind:this={canvas} class="oval-dots-background" aria-hidden="true"></canvas>

<style>
	.oval-dots-background {
		position: absolute;
		z-index: 0;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
