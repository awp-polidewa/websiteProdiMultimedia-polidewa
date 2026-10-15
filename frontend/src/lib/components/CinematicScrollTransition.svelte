<script>
	import { onMount, tick } from 'svelte';

	/** @type {HTMLElement | null} */
	let track = $state(null);
	/** @type {HTMLElement | null} */
	let scene = $state(null);
	/** @type {HTMLHeadingElement | null} */
	let title = $state(null);
	/** @type {HTMLSpanElement | null} */
	let targetLetter = $state(null);
	/** @type {HTMLSpanElement | null} */
	let focusPoint = $state(null);
	let prefersReducedMotion = $state(false);
	let enhanced = $state(true);

	/** @param {number} value @param {number} min @param {number} max */
	function clamp(value, min, max) {
		return Math.min(max, Math.max(min, value));
	}

	/** @param {number} value */
	function smoothstep(value) {
		const progress = clamp(value, 0, 1);
		return progress * progress * (3 - 2 * progress);
	}

	onMount(() => {
		if (!track || !scene || !title || !targetLetter || !focusPoint) return;

		let frame = 0;
		let trackStart = 0;
		let targetScale = 1;
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

		function measure() {
			if (!track || !scene || !title || !targetLetter || !focusPoint) return;

			trackStart = window.scrollY + track.getBoundingClientRect().top;
			const currentTransform = title.style.transform;
			title.style.transform = 'none';
			const titleRect = title.getBoundingClientRect();
			const letterRect = targetLetter.getBoundingClientRect();
			const focusRect = focusPoint.getBoundingClientRect();
			const focusX = focusRect.left - titleRect.left;
			const focusY = focusRect.top - titleRect.top;
			title.style.transformOrigin = `${focusX}px ${focusY}px`;

			const letterWidth = Math.max(1, letterRect.width);
			const letterHeight = Math.max(1, letterRect.height);
			// Overscale beyond the D's viewport-covering size so its outline moves
			// fully outside the scene before the sticky transition is released.
			targetScale = Math.max(scene.clientWidth / letterWidth, scene.clientHeight / letterHeight) * 2.6;
			title.style.transform = currentTransform;
		}

		function render() {
			frame = 0;
			if (prefersReducedMotion || !track || !scene || !title) return;

			const stageHeight = scene.clientHeight;
			const viewportUnit = Math.max(1, stageHeight / 100);
			const scrollVh = clamp((window.scrollY - trackStart) / viewportUnit, 0, 180);
			const textProgress = smoothstep((scrollVh - 30) / 20);
			const backgroundProgress = smoothstep((scrollVh - 50) / 10);
			const zoomProgress = smoothstep((scrollVh - 60) / 105);
			const portalExitProgress = smoothstep((scrollVh - 165) / 10);
			const scale = 1 + (targetScale - 1) * zoomProgress;
			const translateY = 24 * (1 - textProgress);
			const blue = [36, 87, 255];
			/** @param {number} value */
			const channel = (value) => Math.round(255 + (value - 255) * backgroundProgress);

			scene.style.backgroundColor = `rgb(${channel(blue[0])} ${channel(blue[1])} ${channel(blue[2])})`;
			title.style.opacity = String(textProgress * (1 - portalExitProgress));
			title.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
		}

		function scheduleRender() {
			if (!frame) frame = window.requestAnimationFrame(render);
		}

		function resetForReducedMotion() {
			if (!scene || !title) return;
			scene.style.removeProperty('background-color');
			title.style.removeProperty('opacity');
			title.style.removeProperty('transform');
			title.style.removeProperty('transform-origin');
		}

		async function handleMotionChange() {
			prefersReducedMotion = motionQuery.matches;
			enhanced = !prefersReducedMotion;
			await tick();
			if (prefersReducedMotion) {
				if (frame) window.cancelAnimationFrame(frame);
				frame = 0;
				resetForReducedMotion();
			} else {
				measure();
				scheduleRender();
			}
		}

		function handleResize() {
			measure();
			scheduleRender();
		}

		prefersReducedMotion = motionQuery.matches;
		enhanced = !prefersReducedMotion;
		measure();
		if (!prefersReducedMotion) scheduleRender();
		window.addEventListener('scroll', scheduleRender, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });
		motionQuery.addEventListener('change', handleMotionChange);

		return () => {
			window.removeEventListener('scroll', scheduleRender);
			window.removeEventListener('resize', handleResize);
			motionQuery.removeEventListener('change', handleMotionChange);
			if (frame) window.cancelAnimationFrame(frame);
		};
	});
</script>

<section
	class="cinematic-track"
	class:cinematic-track--reduced={prefersReducedMotion}
	aria-label="Transisi visual menuju karya dan publikasi TRM"
	bind:this={track}
>
	<div
		class="cinematic-scene"
		class:cinematic-scene--enhanced={enhanced}
		class:cinematic-scene--reduced={prefersReducedMotion}
		bind:this={scene}
	>
		<h2 class="cinematic-title" bind:this={title}>
			<span class="cinematic-line">TRM</span>
			<span class="cinematic-line">POLI<span class="cinematic-target" bind:this={targetLetter}>D<span class="cinematic-focus" bind:this={focusPoint} aria-hidden="true"></span></span>EWA</span>
		</h2>
	</div>
</section>

<style>
	.cinematic-track { position: relative; z-index: 3; width: 100%; height: 280svh; }
	.cinematic-scene { position: sticky; top: 0; width: 100vw; height: 100svh; display: grid; place-items: center; margin-inline: calc(50% - 50vw); overflow: clip; background: #fff; }
	.cinematic-title { position: relative; z-index: 1; margin: 0; color: #000; font: 900 clamp(3rem, 15.3vw, 15rem)/.82 'Inter', sans-serif; letter-spacing: 0; text-align: center; white-space: nowrap; transform-origin: center; }
	.cinematic-scene--enhanced .cinematic-title { opacity: 0; }
	.cinematic-line { display: block; letter-spacing: 20px; }
	.cinematic-target { position: relative; display: inline-block; line-height: 1; }
	.cinematic-focus { position: absolute; top: 50%; left: 53%; width: 0; height: 0; }
	.cinematic-track--reduced { height: auto; padding-block: clamp(3rem, 8svh, 6rem); }
	.cinematic-scene--reduced { position: relative; height: auto; min-height: 50svh; }
	.cinematic-scene--reduced .cinematic-title { opacity: 1; transform: none; }
	@media (max-width: 700px) {
		.cinematic-title { font-size: clamp(2.5rem, 14.5vw, 4rem); }
		.cinematic-line { letter-spacing: clamp(1px, 1vw, 4px); }
	}
	@media (prefers-reduced-motion: reduce) {
		.cinematic-track { height: auto; padding-block: clamp(3rem, 8svh, 6rem); }
		.cinematic-scene { position: relative; height: auto; min-height: 50svh; }
		.cinematic-title, .cinematic-scene--enhanced .cinematic-title { opacity: 1; transform: none; }
	}
</style>
