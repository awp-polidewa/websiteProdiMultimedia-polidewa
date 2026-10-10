<script>
	import { onMount } from 'svelte';

	/** @type {HTMLCanvasElement} */
	let canvas;

	onMount(() => {
		const context = canvas?.getContext('2d');
		if (!context) return;

		let gap = 32;
		const stops = [
			[51, 51, 255],
			[61, 190, 255],
			[242, 200, 27],
			[30, 30, 48],
			[51, 51, 255]
		];
		const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
		let reduceMotion = reducedMotionQuery.matches;
		let width = 0;
		let height = 0;
		let dpr = 1;
		let canvasRect = canvas.getBoundingClientRect();
		/** @type {{ x: number, y: number, pick: number, offsetX: number, offsetY: number, tilt: number }[]} */
		let points = [];
		/** @type {{ x: number, y: number, age: number, strength: number }[]} */
		let waves = [];
		let mouseX = 0;
		let mouseY = 0;
		let targetX = 0;
		let targetY = 0;
		let pointerClientX = 0;
		let pointerClientY = 0;
		let hasPointer = false;
		let visible = !document.hidden;
		let animationFrame = 0;
		const startTime = performance.now();
		let lastTime = startTime;
		let lastWaveX = 0;
		let lastWaveY = 0;
		let lastWaveAt = startTime;
		const waveSpeed = 490;
		const waveWidth = 76;
		const waveLifetime = 1.65;
		const maxWaves = 3;
		/** @param {number} edge0 @param {number} edge1 @param {number} value */
		const smoothstep = (edge0, edge1, value) => {
			const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
			return x * x * (3 - 2 * x);
		};

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
			const previousWidth = width;
			const previousHeight = height;
			canvasRect = canvas.getBoundingClientRect();
			gap = window.matchMedia('(max-width: 700px)').matches ? 38 : 32;
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = canvasRect.width;
			height = canvasRect.height;
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

			if (hasPointer) {
				targetX = pointerClientX - canvasRect.left;
				targetY = pointerClientY - canvasRect.top;
				mouseX = previousWidth ? (mouseX / previousWidth) * width : targetX;
				mouseY = previousHeight ? (mouseY / previousHeight) * height : targetY;
			} else {
				targetX = mouseX = width * 0.72;
				targetY = mouseY = height * 0.55;
			}
			lastWaveX = mouseX;
			lastWaveY = mouseY;
			if (reduceMotion) drawStatic();
		};

		const updateCanvasBounds = () => {
			canvasRect = canvas.getBoundingClientRect();
			if (hasPointer) {
				targetX = pointerClientX - canvasRect.left;
				targetY = pointerClientY - canvasRect.top;
			}
		};
		const interactionArea = canvas.parentElement;
		const resizeObserver = new ResizeObserver(resize);
		if (interactionArea) resizeObserver.observe(interactionArea);

		/** @param {PointerEvent} event */
		const onPointerMove = (event) => {
			if (coarsePointerQuery.matches || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
			pointerClientX = event.clientX;
			pointerClientY = event.clientY;
			targetX = pointerClientX - canvasRect.left;
			targetY = pointerClientY - canvasRect.top;
			hasPointer = true;
		};
		const onPointerLeave = () => {
			hasPointer = false;
			waves = [];
		};

		const stopAnimation = () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
			animationFrame = 0;
		};
		const startAnimation = () => {
			if (visible && !reduceMotion && !animationFrame) {
				lastTime = performance.now();
				animationFrame = requestAnimationFrame(frame);
			}
		};
		const onVisibilityChange = () => {
			visible = !document.hidden;
			if (visible) startAnimation();
			else stopAnimation();
		};
		/** @param {MediaQueryListEvent} event */
		const onReducedMotionChange = (event) => {
			reduceMotion = event.matches;
			waves = [];
			if (reduceMotion) {
				stopAnimation();
				drawStatic();
			} else {
				startAnimation();
			}
		};

		const drawStatic = () => {
			context.clearRect(0, 0, width, height);
			for (const point of points) {
				context.globalAlpha = 0.05 + point.pick * 0.03;
				context.fillStyle = colorAt(point.pick);
				context.beginPath();
				context.ellipse(point.x, point.y, 0.8, 0.8, 0, 0, Math.PI * 2);
				context.fill();
			}
			context.globalAlpha = 1;
		};

		/** @param {number} now */
		const frame = (now) => {
			animationFrame = 0;
			if (!visible || reduceMotion) return;

			const time = (now - startTime) / 1000;
			const dt = Math.min(0.05, (now - lastTime) / 1000);
			lastTime = now;

			if (!hasPointer) {
				targetX = width * (0.5 + 0.3 * Math.sin(time * 0.3));
				targetY = -canvasRect.top + window.innerHeight * (0.52 + 0.24 * Math.sin(time * 0.4 + 1));
			}

			const mouseEase = 1 - Math.exp(-dt * 4.2);
			const pointEase = 1 - Math.exp(-dt * 7.3);
			mouseX += (targetX - mouseX) * mouseEase;
			mouseY += (targetY - mouseY) * mouseEase;

			const travelX = mouseX - lastWaveX;
			const travelY = mouseY - lastWaveY;
			const travel = Math.sqrt(travelX * travelX + travelY * travelY);
			const spawnDistance = hasPointer ? 42 : 72;
			const spawnInterval = hasPointer ? 140 : 380;
			if (!reduceMotion && travel >= spawnDistance && now - lastWaveAt >= spawnInterval) {
				waves.push({ x: mouseX, y: mouseY, age: 0, strength: hasPointer ? 1 : 0.28 });
				if (waves.length > maxWaves) waves.shift();
				lastWaveX = mouseX;
				lastWaveY = mouseY;
				lastWaveAt = now;
			}
			for (const wave of waves) wave.age += dt;
			waves = waves.filter((wave) => wave.age < waveLifetime);

			context.clearRect(0, 0, width, height);

			for (const point of points) {
				let influence = 0;
				let waveOffset = 0;
				let angle = 0;
				let colorDistance = 0;
				for (const pulse of waves) {
					const dx = point.x - pulse.x;
					const dy = point.y - pulse.y;
					const distance = Math.sqrt(dx * dx + dy * dy) + 0.001;
					const radius = pulse.age * waveSpeed;
					const frontDistance = Math.abs(distance - radius);
					const band = Math.exp(-0.5 * (frontDistance / waveWidth) ** 2);
					const fade = 1 - smoothstep(1.12, waveLifetime, pulse.age);
					const strength = band * fade * pulse.strength;
					if (strength > influence) {
						influence = strength;
						angle = Math.atan2(dy, dx);
						colorDistance = distance;
						waveOffset = Math.sin((distance - radius) * 0.028) * strength * 18;
					}
				}
				const pick = point.pick > 0.6 ? 1 : 0.2;

				const directionX = Math.cos(angle);
				const directionY = Math.sin(angle);
				point.offsetX += (directionX * waveOffset - point.offsetX) * pointEase;
				point.offsetY += (directionY * waveOffset - point.offsetY) * pointEase;
				point.tilt += (influence * pick - point.tilt) * pointEase;

				const radiusSize = 0.8 + influence * 0.8;
				const shortAxis = radiusSize * (1 - point.tilt * 0.2);
				const longAxis = Math.max(shortAxis, radiusSize * (1 + point.tilt * 1.5) - point.tilt);

				context.globalAlpha = 0.05 + influence * 0.9 * (0.35 + 0.65 * pick);
				context.fillStyle = colorAt(angle / (Math.PI * 2) + 0.5 + colorDistance * 0.0006 + time * 0.03);
				context.beginPath();
				context.ellipse(point.x + point.offsetX, point.y + point.offsetY, longAxis, shortAxis, angle, 0, Math.PI * 2);
				context.fill();
			}
			context.globalAlpha = 1;
			animationFrame = requestAnimationFrame(frame);
		};

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('scroll', updateCanvasBounds, { passive: true });
		interactionArea?.addEventListener('pointermove', onPointerMove, { passive: true });
		interactionArea?.addEventListener('pointerleave', onPointerLeave);
		document.addEventListener('visibilitychange', onVisibilityChange);
		reducedMotionQuery.addEventListener('change', onReducedMotionChange);
		if (reduceMotion) drawStatic();
		else startAnimation();

		return () => {
			stopAnimation();
			resizeObserver.disconnect();
			window.removeEventListener('resize', resize);
			window.removeEventListener('scroll', updateCanvasBounds);
		interactionArea?.removeEventListener('pointermove', onPointerMove);
		interactionArea?.removeEventListener('pointerleave', onPointerLeave);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
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
