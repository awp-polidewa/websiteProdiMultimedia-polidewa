<script>
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	let { textEntranceDuration = 500 } = $props();

	const storyCards = [
		{
			label: 'Konsentrasi 01',
			title: 'Web Design',
			description: 'Rancang antarmuka dan pengalaman web, dari struktur halaman hingga implementasi interaktif.',
			cta: 'Pelajari program studi',
			href: '/profil',
			image: '/images/konsentrasi/konsentrasi-01.jpg',
			background: '#dce7ed'
		},
		{
			label: 'Konsentrasi 02',
			title: 'Desain Grafis',
			description: 'Olah tipografi, warna, dan komposisi untuk menyampaikan pesan melalui media visual.',
			cta: 'Pelajari program studi',
			href: '/profil',
			image: '/images/konsentrasi/konsentrasi-02.jpg',
			background: '#e8e1dc'
		},
		{
			label: 'Konsentrasi 03',
			title: 'Videografi',
			description: 'Produksi video melalui perencanaan, pengambilan gambar, penyuntingan, dan penyajian cerita.',
			cta: 'Pelajari program studi',
			href: '/profil',
			image: '/images/konsentrasi/konsentrasi-03.jpg',
			background: '#e2e6df'
		},
		{
			label: 'Konsentrasi 04',
			title: 'Animation',
			description: 'Bangun gerak dan cerita visual melalui teknik animasi dua dimensi maupun tiga dimensi.',
			cta: 'Pelajari program studi',
			href: '/profil',
			image: '/images/konsentrasi/konsentrasi-04.jpg',
			background: '#e6e1eb'
		}
	];

	let storyTrack = $state(/** @type {HTMLElement | null} */ (null));
	let scrollProgress = $state(0);
	let prefersReducedMotion = $state(false);
	let activeIndex = $derived(Math.min(storyCards.length - 1, Math.floor(scrollProgress + 0.000001)));

	/** @param {number} value @param {number} min @param {number} max */
	function clamp(value, min, max) {
		return Math.min(max, Math.max(min, value));
	}

	/** @param {number} index */
	function getCardStyle(index) {
		const lastIndex = storyCards.length - 1;
		const localProgress = activeIndex < lastIndex ? clamp(scrollProgress - activeIndex, 0, 1) : 0;
		const easedProgress = localProgress * localProgress * (3 - 2 * localProgress);
		let y = 0;
		let rotation = -index * 10;
		let scale = 1;
		let opacity = 1;
		let zIndex = 100 - index;

		if (prefersReducedMotion) {
			// Keep a static, centered stack when motion is reduced.
		} else if (index < activeIndex) {
			y = -125;
			rotation = -12;
			scale = 0.9;
			opacity = 0;
			zIndex = 200;
		} else if (index === activeIndex && activeIndex < lastIndex) {
			const exitProgress = easedProgress;
			y = -125 * exitProgress;
			rotation = -12 * exitProgress;
			scale = 1 - 0.1 * exitProgress;
			opacity = 1 - exitProgress;
			zIndex = 200;
		} else {
			const depth = Math.max(0, index - activeIndex - easedProgress);
			rotation = -depth * 10;
			zIndex = 100 - index;
		}

		return `--card-y:${y}%;--card-rotation:${rotation}deg;--card-scale:${scale};--card-opacity:${opacity};--card-background:${storyCards[index].background};z-index:${zIndex};`;
	}

	onMount(() => {
		let frame = 0;
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

		function renderProgress() {
			frame = 0;
			if (prefersReducedMotion || !storyTrack) {
				scrollProgress = 0;
				return;
			}
			const trackTop = window.scrollY + storyTrack.getBoundingClientRect().top;
			const stepDistance = Math.max(1, window.innerHeight * 0.5);
			scrollProgress = clamp((window.scrollY - trackTop) / stepDistance, 0, storyCards.length - 1);
		}

		function scheduleProgress() {
			if (!frame) frame = window.requestAnimationFrame(renderProgress);
		}

		function handleResize() {
			scheduleProgress();
		}

		function handleMotionChange() {
			prefersReducedMotion = motionQuery.matches;
			scheduleProgress();
		}

		prefersReducedMotion = motionQuery.matches;
		window.addEventListener('scroll', scheduleProgress, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });
		motionQuery.addEventListener('change', handleMotionChange);
		scheduleProgress();

		return () => {
			window.removeEventListener('scroll', scheduleProgress);
			window.removeEventListener('resize', handleResize);
			motionQuery.removeEventListener('change', handleMotionChange);
			if (frame) window.cancelAnimationFrame(frame);
		};
	});
</script>

<section
	class="story-track"
	class:story-track--reduced={prefersReducedMotion}
	style={`--story-track-height:${100 + (storyCards.length - 1) * 50}svh`}
	bind:this={storyTrack}
	aria-label="Konsentrasi Teknologi Rekayasa Multimedia"
>
	<div class="story-stage" class:story-stage--reduced={prefersReducedMotion}>
		<div class="story-copy" aria-live="polite" aria-atomic="true" data-aos="fade-up" data-aos-duration={textEntranceDuration} data-aos-delay="0" data-aos-anchor=".story-track" data-aos-once="true">
			{#key activeIndex}
				<div class="story-copy-panel">
					<div class="story-motion-item">
						<p class="story-label" in:fly={{ y: 8, duration: prefersReducedMotion ? 0 : 340, easing: cubicOut }} out:fly={{ y: -6, duration: prefersReducedMotion ? 0 : 260, easing: cubicOut }}>{storyCards[activeIndex].label}</p>
					</div>
					<div class="story-motion-item">
						<h2 in:fly={{ y: 12, duration: prefersReducedMotion ? 0 : 380, easing: cubicOut }} out:fly={{ y: -10, duration: prefersReducedMotion ? 0 : 300, easing: cubicOut }}>{storyCards[activeIndex].title}</h2>
					</div>
					<div class="story-motion-item">
						<p class="story-description" in:fly={{ y: 10, duration: prefersReducedMotion ? 0 : 360, delay: prefersReducedMotion ? 0 : 45, easing: cubicOut }} out:fly={{ y: -8, duration: prefersReducedMotion ? 0 : 280, easing: cubicOut }}>{storyCards[activeIndex].description}</p>
					</div>
					<div class="story-motion-item story-motion-cta">
						<a class="story-cta" href={storyCards[activeIndex].href} in:fly={{ y: 8, duration: prefersReducedMotion ? 0 : 340, delay: prefersReducedMotion ? 0 : 85, easing: cubicOut }} out:fly={{ y: -6, duration: prefersReducedMotion ? 0 : 260, easing: cubicOut }}>
							{storyCards[activeIndex].cta}<span aria-hidden="true">↗</span>
						</a>
					</div>
				</div>
			{/key}
		</div>

		<div class="story-card-deck" aria-hidden="true" data-aos="fade-up" data-aos-duration="300" data-aos-delay="200" data-aos-anchor=".story-track" data-aos-once="true">
			{#each storyCards as card, index (card.title)}
				<article class="story-card" style={getCardStyle(index)}>
					<img src={card.image} alt="" fetchpriority={index === 0 ? 'high' : 'auto'} />
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.story-track { position: relative; width: 100%; height: var(--story-track-height); }
	.story-stage { position: sticky; top: 0; box-sizing: border-box; width: 100%; height: 100svh; min-height: 620px; display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); align-items: center; gap: clamp(2rem, 5vw, 5rem); padding: clamp(2rem, 6vw, 5.5rem); }
	.story-copy { position: relative; z-index: 5; display: grid; align-items: center; max-width: 540px; min-height: 340px; text-align: left; }
	.story-copy-panel { grid-area: 1 / 1; width: 100%; }
	.story-motion-item { width: 100%; }
	.story-motion-cta { width: fit-content; }
	.story-label { margin: 0 0 1.25rem; color: #575656; font: 500 .75rem/1.4 'Inter', sans-serif; letter-spacing: .13em; text-transform: uppercase; }
	.story-copy h2 { max-width: 520px; margin: 0; color: #313131; font: 500 clamp(3rem, 6vw, 5.5rem)/.98 'Poppins', sans-serif; letter-spacing: -.065em; text-wrap: balance; }
	.story-description { max-width: 440px; margin: 1.5rem 0 0; color: #4d4a4a; font: 400 clamp(1rem, 1.4vw, 1.125rem)/1.7 'Inter', sans-serif; }
	.story-cta { display: inline-flex; min-height: 50px; align-items: center; justify-content: center; gap: 1.5rem; margin-top: 2rem; padding: .75rem 1.5rem; border-radius: 999px; background: #002981; color: #fff; font: 500 .9rem/1.2 'Inter', sans-serif; text-decoration: none; transition: background-color 180ms ease, transform 180ms ease; }
	.story-cta:hover { background: #001f62; transform: translateY(-2px); }
	.story-cta:focus-visible { outline: 3px solid #ff5a14; outline-offset: 4px; }
	.story-card-deck { position: relative; width: 100%; height: min(82svh, 680px); min-height: 500px; }
	.story-card { position: absolute; top: 50%; left: 50%; width: clamp(260px, 25.25vw, 364px); aspect-ratio: 364 / 455; overflow: hidden; border: 1px solid rgb(30 35 40 / 7%); border-radius: 24px; background: var(--card-background); box-shadow: 0 16px 44px rgb(37 45 52 / 12%); transform: translate(-50%, -50%) translateY(var(--card-y)) rotate(var(--card-rotation)) scale(var(--card-scale)); transform-origin: center center; opacity: var(--card-opacity); will-change: transform, opacity; }
	.story-card img { display: block; width: 100%; height: 100%; object-fit: cover; }
	.story-track--reduced { height: 100svh; }
	.story-stage--reduced { position: relative; }
	.story-stage--reduced .story-card { transform: translate(-50%, -50%) rotate(var(--card-rotation)) scale(var(--card-scale)); }
	@media (max-width: 760px) {
		.story-stage { min-height: 100svh; height: 100svh; display: flex; align-items: stretch; flex-direction: column; justify-content: center; gap: .4rem; padding: max(4.5rem, calc(env(safe-area-inset-top, 0px) + 4rem)) 1rem 1.25rem; }
		.story-copy { order: 2; max-width: 620px; min-height: clamp(250px, 32svh, 300px); flex: 0 0 auto; margin: 0 auto; text-align: center; }
		.story-label { margin-bottom: .5rem; }
		.story-copy h2 { max-width: none; font-size: clamp(2.25rem, 10vw, 3.5rem); }
		.story-description { margin: .75rem auto 0; font-size: .95rem; line-height: 1.55; }
		.story-cta { min-height: 46px; margin-top: 1rem; }
		.story-card-deck { order: 1; width: 100%; height: 46svh; min-height: 220px; max-height: 380px; flex: 0 0 auto; }
		.story-card { width: min(51vw, 225px); border-radius: 18px; }
		.story-stage--reduced { height: auto; min-height: 100svh; }
	}
	@media (max-height: 700px) and (min-width: 761px) {
		.story-stage { min-height: 0; padding-block: 2rem; }
		.story-card-deck { min-height: min(68svh, 420px); }
		.story-card { width: min(24vw, 300px); }
		.story-copy h2 { font-size: clamp(2.75rem, 5vw, 4rem); }
	}
	@media (prefers-reduced-motion: reduce) {
		.story-card { will-change: auto; }
		.story-cta { transition: none; }
	}
</style>
